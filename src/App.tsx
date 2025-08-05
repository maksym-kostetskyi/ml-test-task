import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";

import Header from "./components/Layout/Header";
import FileUploadComponent from "./components/FileUpload/FileUploadComponent";
import ExperimentTable from "./components/ExperimentList/ExperimentTable";
import ChartContainer from "./components/Charts/ChartContainer";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <Header />

        <div className="grid">
          <div className="col-12">
            <FileUploadComponent />
          </div>

          <div className="col-12">
            <ExperimentTable />
          </div>

          <div className="col-12">
            <ChartContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
