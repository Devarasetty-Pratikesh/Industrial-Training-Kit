import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from model.train_model import prepare_dataset, train_and_evaluate, MODEL_PATH, CSV_PATH

app = Flask(__name__)
# Secret key for sessions
app.secret_key = 'ai_classification_system_secret_key'

# Global state to track statistics (in-memory)
prediction_counter = 0
last_prediction = None
active_metrics = None

# Ensure dataset and model are initialized on startup
def init_app():
    global active_metrics
    print("Initializing Application...")
    
    # 1. Ensure dataset exists
    prepare_dataset()
    
    # 2. Check if classifier is trained, if not train it with default K=5
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running initial training with K=5...")
        active_metrics = train_and_evaluate(k=5)
    else:
        print("Model file found. Loading parameters...")
        try:
            with open(MODEL_PATH, 'rb') as f:
                data = pickle.load(f)
                # Re-run training to ensure all graphs are generated in the current environment
                active_metrics = train_and_evaluate(k=data.get('k', 5))
        except Exception as e:
            print(f"Error loading model: {e}. Retraining...")
            active_metrics = train_and_evaluate(k=5)

init_app()

def get_dataset_rows():
    """Reads dataset/iris.csv and returns it as a list of dicts for JS rendering"""
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
        return df.to_dict(orient='records')
    return []

def get_shared_context(section_name):
    """Generates standard parameters shared across index rendering routes"""
    return {
        'active_section': section_name,
        'metrics': active_metrics,
        'raw_data': get_dataset_rows(),
        'session_stats': {
            'predict_count': prediction_counter,
            'last_prediction': last_prediction
        }
    }

# ----------------------------------------------------
# ROUTES
# ----------------------------------------------------

@app.route('/')
def route_home():
    return render_template('index.html', **get_shared_context('home'))

@app.route('/dataset')
def route_dataset():
    return render_template('index.html', **get_shared_context('dataset'))

@app.route('/train', methods=['GET', 'POST'])
def route_train():
    global active_metrics
    if request.method == 'POST':
        try:
            # Handle AJAX retraining
            k = int(request.form.get('k', 5))
            if k < 1 or k > 15:
                return jsonify({'status': 'error', 'message': 'K must be between 1 and 15.'}), 400
            
            # Retrain KNN
            new_metrics = train_and_evaluate(k=k)
            active_metrics = new_metrics
            
            return jsonify({
                'status': 'success',
                'k': k,
                'metrics': new_metrics
            })
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
            
    # GET request
    return render_template('index.html', **get_shared_context('train'))

@app.route('/predict', methods=['GET', 'POST'])
def route_predict():
    global prediction_counter, last_prediction
    if request.method == 'POST':
        try:
            # 1. Fetch form input values
            sepal_length = float(request.form.get('sepal_length', 5.1))
            sepal_width = float(request.form.get('sepal_width', 3.5))
            petal_length = float(request.form.get('petal_length', 1.4))
            petal_width = float(request.form.get('petal_width', 0.2))
            
            # Formulate inputs array
            input_features = np.array([[sepal_length, sepal_width, petal_length, petal_width]])
            
            # 2. Load model and scaler
            with open(MODEL_PATH, 'rb') as f:
                saved_data = pickle.load(f)
                model = saved_data['model']
                scaler = saved_data['scaler']
                classes = saved_data['classes']
                
            # 3. Apply standard scaler
            scaled_features = scaler.transform(input_features)
            
            # 4. Predict
            pred_species = model.predict(scaled_features)[0]
            pred_probs = model.predict_proba(scaled_features)[0]
            
            # Create dictionary mapping class names to probabilities
            prob_dict = {cls: float(p) for cls, p in zip(classes, pred_probs)}
            confidence = float(np.max(pred_probs))
            
            # 5. Update global statistics
            prediction_counter += 1
            last_prediction = {
                'inputs': {
                    'sepal_length': sepal_length,
                    'sepal_width': sepal_width,
                    'petal_length': petal_length,
                    'petal_width': petal_width
                },
                'prediction': pred_species,
                'confidence': confidence
            }
            
            # 6. Render results page
            return render_template('result.html', 
                                   prediction=pred_species, 
                                   confidence=confidence, 
                                   prob_dict=prob_dict, 
                                   inputs=last_prediction['inputs'])
        except Exception as e:
            return f"An error occurred during prediction: {e}", 500

    # GET request
    return render_template('index.html', **get_shared_context('predict'))

@app.route('/evaluation')
def route_evaluation():
    return render_template('index.html', **get_shared_context('evaluation'))

@app.route('/about')
def route_about():
    return render_template('index.html', **get_shared_context('about'))

@app.route('/download_csv')
def route_download_csv():
    if os.path.exists(CSV_PATH):
        return send_file(CSV_PATH, as_attachment=True, download_name='iris.csv', mimetype='text/csv')
    return "Dataset file not found.", 404

@app.route('/graphs/<path:filename>')
def route_serve_graphs(filename):
    return send_from_directory('graphs', filename)

if __name__ == '__main__':
    # Run locally on port 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
