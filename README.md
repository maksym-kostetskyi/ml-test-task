# MLOps Experiment Tracking Frontend

A React-based web application for uploading, inspecting, and comparing machine learning experiment logs. Built with React, TypeScript, PrimeReact, and Recharts.

## Features

### Core Features

- **📁 File Upload**: Drag & drop CSV file upload with validation
- **📊 Experiment Management**: View and select experiments from uploaded data
- **📈 Interactive Charts**: Line charts for all tracked metrics across selected experiments
- **🔍 Search & Filter**: Search experiments and filter data

### Advanced Features

- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **💾 Data Persistence**: Uploaded data persists across browser sessions (small datasets only)
- **🗄️ Smart Storage**: Large datasets (>10K points) don't persist to avoid browser storage limits
- **📥 Export Capabilities**: Export chart data as CSV
- **🎨 Professional UI**: Clean, modern interface using PrimeReact components
- **⚡ Performance Optimized**: Efficient data processing and visualization
- **🧠 Smart Sampling**: MLflow-style adaptive step sampling for large datasets (25K+ points → ~25 optimized points)
- **📊 Data Density Indicators**: Visual feedback when data sampling is applied

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: PrimeReact (similar to PrimeVue)
- **Charts**: Recharts
- **State Management**: Zustand
- **Styling**: PrimeFlex + Custom CSS
- **CSV Processing**: react-papaparse
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd ml-test-task
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## CSV Data Format

The application expects CSV files with the following columns:

| Column          | Type   | Description                                           |
| --------------- | ------ | ----------------------------------------------------- |
| `experiment_id` | String | Unique identifier for the experiment                  |
| `metric_name`   | String | Name of the tracked metric (e.g., "loss", "accuracy") |
| `step`          | Number | Training step at which the metric was logged          |
| `value`         | Number | Value of the metric at that step                      |

### Example CSV Data

```csv
experiment_id,metric_name,step,value
exp_001,loss,0,0.9523
exp_001,loss,1,0.8932
exp_001,accuracy,0,0.1234
exp_001,accuracy,1,0.2345
exp_002,loss,0,0.9123
exp_002,loss,1,0.8654
```

A sample file with 25K data points is included in the `sample_data/` folder for testing large datasets.

## Usage

1. **Upload Data**: Drag and drop a CSV file or click "Choose File" to upload experiment data
2. **Select Experiments**: Use the experiment table to select one or more experiments for visualization
3. **View Charts**: Interactive line charts will display for each metric across selected experiments
4. **Export Data**: Click the download button on any chart to export the data as CSV

## Project Structure

```
src/
├── components/
│   ├── FileUpload/          # File upload component
│   ├── ExperimentList/      # Experiment table and selection
│   ├── Charts/              # Chart components
│   └── Layout/              # Header and layout components
├── hooks/                   # Custom React hooks
├── store/                   # Zustand state management
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
└── App.tsx                  # Main application component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Dependencies

- **primereact**: UI component library
- **recharts**: Chart library for React
- **zustand**: Lightweight state management
- **react-papaparse**: CSV parsing library
- **primeflex**: CSS utility framework

## Features in Detail

### File Upload

- Drag & drop interface with visual feedback
- File validation (CSV format, size limits)
- Error handling with user-friendly messages
- Progress indication during processing

### Experiment Management

- Sortable and searchable data table
- Multi-select functionality with checkboxes
- Summary statistics for each experiment
- Responsive design for mobile devices

### Data Visualization

- Interactive line charts with hover tooltips
- Multiple experiments on same chart with different colors
- Automatic color generation for unlimited experiments
- Zoom and pan capabilities
- Export functionality

### State Management

- Persistent storage using browser localStorage
- Optimistic UI updates
- Error boundary handling
- Loading states throughout the application

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
   {
   files: ['**/*.{ts,tsx}'],
   extends: [
   // Other configs...
   // Enable lint rules for React
   reactX.configs['recommended-typescript'],
   // Enable lint rules for React DOM
   reactDom.configs.recommended,
   ],
   languageOptions: {
   parserOptions: {
   project: ['./tsconfig.node.json', './tsconfig.app.json'],
   tsconfigRootDir: import.meta.dirname,
   },
   // other options...
   },
   },
   ])

```

```
