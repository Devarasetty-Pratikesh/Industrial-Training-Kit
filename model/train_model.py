import os
import time
import pickle
import numpy as np
import pandas as pd
import matplotlib
# Use Agg backend for matplotlib to avoid GUI thread issues when running headlessly or in Flask
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, precision_recall_fscore_support

# Ensure target directories exist
os.makedirs('dataset', exist_ok=True)
os.makedirs('model', exist_ok=True)
os.makedirs('graphs', exist_ok=True)

CSV_PATH = os.path.join('dataset', 'iris.csv')
MODEL_PATH = os.path.join('model', 'classifier.pkl')

def prepare_dataset():
    """
    Loads Iris dataset from sklearn and saves it to dataset/iris.csv if not exists.
    Returns the DataFrame.
    """
    if not os.path.exists(CSV_PATH):
        iris = load_iris()
        df = pd.DataFrame(data=iris.data, columns=['sepal_length', 'sepal_width', 'petal_length', 'petal_width'])
        
        # Map target numbers to species names
        species_map = {0: 'setosa', 1: 'versicolor', 2: 'virginica'}
        df['species'] = [species_map[t] for t in iris.target]
        
        df.to_csv(CSV_PATH, index=False)
        print(f"Dataset saved to {CSV_PATH}")
    else:
        df = pd.read_csv(CSV_PATH)
    return df

def get_best_k(X_train, X_test, y_train, y_test):
    """
    Iterates K from 1 to 15 to find the K that yields the highest testing accuracy.
    Returns a dictionary mapping k to test_accuracy, and the suggested best K.
    """
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    k_results = {}
    best_k = 5
    best_acc = 0.0
    
    for k in range(1, 16):
        knn = KNeighborsClassifier(n_neighbors=k, weights='uniform', metric='euclidean')
        knn.fit(X_train_scaled, y_train)
        y_pred = knn.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)
        k_results[k] = acc
        if acc > best_acc:
            best_acc = acc
            best_k = k
            
    return k_results, best_k

def train_and_evaluate(k=5, weights='uniform', metric='euclidean'):
    """
    Trains KNN model with standard preprocessing. Saves classifier.pkl.
    Generates and saves visual plots under graphs/.
    Returns model metrics and statistics.
    """
    start_time = time.time()
    
    # 1. Load dataset
    df = prepare_dataset()
    
    X = df[['sepal_length', 'sepal_width', 'petal_length', 'petal_width']]
    y = df['species']
    
    # 2. Train-Test Split (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, shuffle=True, stratify=y
    )
    
    # 3. Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Train Model
    knn = KNeighborsClassifier(n_neighbors=k, weights=weights, metric=metric)
    knn.fit(X_train_scaled, y_train)
    
    # Measure training time
    training_time_ms = (time.time() - start_time) * 1000
    
    # 5. Evaluate
    y_pred_train = knn.predict(X_train_scaled)
    y_pred_test = knn.predict(X_test_scaled)
    
    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)
    
    # Precision, Recall, F1
    # We set average='macro' to compute metric independently for each class and take average
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred_test, average='macro')
    
    # Classification Report
    cls_report = classification_report(y_test, y_pred_test, output_dict=True)
    cls_report_txt = classification_report(y_test, y_pred_test)
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred_test)
    classes = sorted(y.unique())
    
    # 6. Save Model and Scaler
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({
            'model': knn,
            'scaler': scaler,
            'features': list(X.columns),
            'classes': classes,
            'k': k
        }, f)
        
    # Find Best K suggestion
    k_accuracies, best_k = get_best_k(X_train, X_test, y_train, y_test)
    
    # 7. Generate Graphs
    # A. Pair Plot
    plt.figure(figsize=(10, 8))
    sns.set_theme(style="whitegrid")
    # For pairplot we use dataframe directly
    pair_plot_fig = sns.pairplot(df, hue='species', palette='muted', height=2.0)
    pair_plot_fig.savefig(os.path.join('graphs', 'pairplot.png'), dpi=150)
    plt.close('all')
    
    # B. Confusion Matrix Heatmap
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes, cbar=False)
    plt.title(f'Confusion Matrix (K={k})', fontsize=14, pad=15)
    plt.ylabel('Actual Species', fontsize=12)
    plt.xlabel('Predicted Species', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join('graphs', 'confusion_matrix.png'), dpi=150)
    plt.close()
    
    # C. Accuracy Graph (Training vs Testing Accuracy)
    plt.figure(figsize=(6, 4))
    bars = plt.bar(['Training Accuracy', 'Testing Accuracy'], [train_acc * 100, test_acc * 100], 
                   color=['#1c2541', '#48cae4'], width=0.5)
    plt.ylabel('Accuracy (%)')
    plt.title('Model Accuracy Comparison')
    plt.ylim(0, 110)
    
    # Annotate bar values
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 2, f"{yval:.2f}%", ha='center', va='bottom', fontweight='bold')
        
    plt.tight_layout()
    plt.savefig(os.path.join('graphs', 'accuracy_graph.png'), dpi=150)
    plt.close()
    
    # D. Correlation Heatmap (features only)
    plt.figure(figsize=(6, 5))
    corr = X.corr()
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1, square=True)
    plt.title('Feature Correlation Matrix', fontsize=14, pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join('graphs', 'correlation_matrix.png'), dpi=150)
    plt.close()
    
    # E. Box Plot of features by species
    # Reshape the dataframe for easy plotting
    df_melt = pd.melt(df, id_vars='species', var_name='feature', value_name='value')
    plt.figure(figsize=(10, 6))
    sns.boxplot(x='feature', y='value', hue='species', data=df_melt, palette='Set2')
    plt.title('Feature Distribution by Species', fontsize=14, pad=15)
    plt.ylabel('Measurements (cm)', fontsize=12)
    plt.xlabel('Features', fontsize=12)
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig(os.path.join('graphs', 'boxplots.png'), dpi=150)
    plt.close()
    
    return {
        'training_time_ms': round(training_time_ms, 2),
        'train_accuracy': round(train_acc, 4),
        'test_accuracy': round(test_acc, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'total_samples': len(df),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'best_k': best_k,
        'k_accuracies': k_accuracies,
        'confusion_matrix': cm.tolist(),
        'classification_report': cls_report,
        'classification_report_txt': cls_report_txt
    }

if __name__ == '__main__':
    print("Pre-training verification script starting...")
    results = train_and_evaluate(k=5)
    print("\nTraining completed successfully!")
    print(f"Total Samples: {results['total_samples']}")
    print(f"Training Samples: {results['train_samples']}")
    print(f"Testing Samples: {results['test_samples']}")
    print(f"Training Accuracy: {results['train_accuracy']*100:.2f}%")
    print(f"Testing Accuracy: {results['test_accuracy']*100:.2f}%")
    print(f"Suggested Best K: {results['best_k']}")
    print(f"Model saved to: {MODEL_PATH}")
    print("All evaluation plots generated under graphs/ directory.")
