import Papa from "papaparse";

export const loadData = (csvFilePath, callback) => {
  fetch(csvFilePath)
    .then(response => response.text())
    .then(data => {
      Papa.parse(data, {
        header: true,
        complete: (results) => {
          callback(results.data);
        }
      });
    });
};