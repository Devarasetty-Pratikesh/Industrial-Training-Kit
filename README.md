# Data Classification Using AI (Supervised Machine Learning using K-Nearest Neighbors)

A complete, production-ready AI-based web application that demonstrates the supervised learning pipeline by classifying flower species using the Iris dataset. 

This project features a modern, interactive dashboard built with a responsive glassmorphism theme, real-time model retraining, dynamic data visualizations, and instant class predictions.

---

## 🌟 Key Features

* **Complete ML Pipeline**: Demonstrates dataset preparation, standard scaling, train-test splitting (80/20), training, evaluation, and inference.
* **Interactive Model Tuning**: Dynamically adjust the number of neighbors ($K$ from 1 to 15) using a slider and trigger model retraining instantly. The system will auto-suggest the mathematically optimal $K$ based on accuracy scans.
* **Dynamic Dataset Explorer**: Complete scrollable dataset table with client-side searching, sorting, and pagination, along with a direct CSV download handler.
* **Professional Visualizations**: High-quality plots automatically generated on model training:
  * **Pair Plot**: Pairwise relationships colored by species.
  * **Confusion Matrix Heatmap**: Displays TP, TN, FP, and FN counts with text explanations.
  * **Accuracy Graph**: Side-by-side comparison of training vs. testing accuracy.
  * **Correlation Matrix Heatmap**: Visualizes linear correlation between flower anatomy features.
  * **Feature Distribution Box Plots**: Visualizes feature variance across Setosa, Versicolor, and Virginica.
* **Real-time Prediction**: Classify flower species using Sepal Length/Width and Petal Length/Width. The system validates inputs and outputs prediction confidence, class probabilities, scientific details, and botanical illustrations.
* **Aesthetics**: Premium responsive dashboard supporting **Dark Mode** and **Light Mode**, glassmorphism cards, micro-animations, loading spinners, and toast alerts.

---

## 📂 Project Structure

```text
AI-Classification/
├── app.py                     # Main Flask web application server
├── requirements.txt           # Python dependency specifications
├── README.md                  # Professional project documentation
│
├── dataset/
│   └── iris.csv               # Local copy of the Iris dataset (auto-generated)
│
├── model/
│   ├── train_model.py         # Modular model training, tuning, and plotting logic
│   └── classifier.pkl         # Saved KNN model and fitted StandardScaler binary
│
├── static/
│   ├── css/
│   │   └── style.css          # Color design variables, dark theme layout, animations
│   ├── js/
│   │   └── script.js          # Dynamic UI switches, AJAX calls, search/filter table
│   └── images/
│       ├── setosa.png         # Botanical illustration for Iris Setosa (AI generated)
│       ├── versicolor.png     # Botanical illustration for Iris Versicolor (AI generated)
│       └── virginica.png      # Botanical illustration for Iris Virginica (AI generated)
│
├── templates/
│   ├── index.html             # Master dashboard layout (multiple route sections)
│   └── result.html            # Prediction result page (detailed species card)
│
└── graphs/
    ├── confusion_matrix.png   # Seaborn confusion matrix plot (auto-updated)
    ├── accuracy_graph.png     # Bar chart comparing train vs. test accuracy (auto-updated)
    ├── correlation_matrix.png # Feature correlation heatmap (auto-updated)
    ├── boxplots.png           # Feature range distribution box plot (auto-updated)
    └── pairplot.png           # Complete dataset pairplot (auto-updated)
```

---

## ⚙️ Installation & Requirements

### Prerequisites
* Python 3.8 to 3.13
* Web Browser (Chrome, Firefox, Edge, Safari)

### Required Libraries
All required packages are listed in `requirements.txt`:
* **Flask** - Web framework
* **pandas** - Data structures and loading
* **numpy** - Vectorized math operations
* **scikit-learn** - KNN classifier and preprocessing scalers
* **matplotlib** - Graph plotting engine
* **seaborn** - Statistical data visualization

### Step-by-Step Setup

1. **Clone or Extract** the project folder to your local machine.
2. **Navigate** into the project directory:
   ```bash
   cd DECODELABS_P2
   ```
3. **Install Dependencies** using pip:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the Application**:
   ```bash
   python app.py
   ```
5. **Open Browser**: Go to `http://127.0.0.1:5000` in your web browser.

*Note: The application will automatically check for `dataset/iris.csv` and `model/classifier.pkl`. If not found, it runs an initial model training with $K=5$ and generates all graphs on startup.*

---

## 🔬 Machine Learning Pipeline Detail

### 1. Data Preprocessing
* **Normalization**: Since KNN relies on calculating distance vectors, features with wider scales can dominate. We apply `StandardScaler` to calculate $Z$-scores:
  $$Z = \frac{x - \mu}{\sigma}$$
* **Stratification**: During the 80% train / 20% test split, `stratify=y` ensures that each class remains equally represented in both splits, maintaining balance.

### 2. K-Nearest Neighbors (KNN)
* **Algorithm**: For a query point $x$, KNN identifies the $K$ points in the training set closest to $x$ under the distance metric. It assigns the class that gets the majority vote.
* **Euclidean Distance Formula**:
  $$d(p, q) = \sqrt{\sum_{i=1}^n (p_i - q_i)^2}$$
* **Parameters**: Metric: Euclidean ($L_2$ norm), weights: Uniform (all neighbors carry equal voting weights).

---

## 🚀 Future Enhancements

* **Multi-Algorithm Comparison**: Integrate additional algorithms like Random Forest, Support Vector Machines (SVM), and Decision Trees, and add a performance comparison dashboard.
* **Custom Dataset Upload**: Support uploading custom CSV files for dynamic training on any tabular classification task.
* **Deep Learning Integration**: Include a Multi-Layer Perceptron (MLP) neural network classifier.
* **Cloud Deployment**: Add a Dockerfile and CI/CD pipelines to host on cloud platforms like Render, Heroku, or GCP.
