import React from 'react'
import './App.css'

import BRCAnessChart from "./Components/BRCAnessChart"

import HRDScores from "./data/TCGA.HRD_withSampleID.json"
import PhenoTypeData from "./data/TCGA_phenotype_denseDataOnlyDownload.json"

import { Boxplot, computeBoxplotStats } from 'react-boxplot'


function join_data(PhenoTypeData, HRDScores) {
    // Join by sampleId
    let phenotype_ids = new Set(
        PhenoTypeData
            .map(d => d.sample)
            .filter(d => d !== undefined)
    );
    let common_ids = new Set();
    HRDScores.forEach(d => {
        if (phenotype_ids.has(d.sampleID))
            common_ids.add(d.sampleID);
    });
    let ans_obj = {};
    for (let row of PhenoTypeData) {
        if (common_ids.has(row.sample))
            ans_obj[row.sample] = row;
    }
    for (let row of HRDScores) {
        if (common_ids.has(row.sampleID))
            Object.assign(ans_obj[row.sampleID], row);
    }

    let ans = [];
    for (let key in ans_obj) {
        ans.push(ans_obj[key]);
    }

    return ans;
}


class App extends React.Component {
    constructor() {
        super();
        this.state = {
            plotData: null
        };
    }

    componentDidMount() {
        // TODO: load the data remotely

        // Join the data by sampleID
        let plotData = join_data(PhenoTypeData, HRDScores);

        /*
           let all_types = new Set(PhenoTypeData.map(d => d.sample_type));
           let all_diseases = new Set(PhenoTypeData.map(d => d._primary_disease))

           const all_cancer_types = new Set(
           PhenoTypeData
           .map(d => d._primary_disease)
           .map(d => d !== undefined)
           );

           const ovarian_cancer = "ovarian serous cystadenocarcinoma";

           let ovarian_samples = new Set(
           PhenoTypeData
           .filter(d => d._primary_disease === ovarian_cancer)
           .map(d => d.sample)
           );
           let ovarian_scores = HRDScores
           .filter(d => ovarian_samples.has(d.sampleID))
         */

        this.setState({
            plotData: plotData
        });
    }

    render() {

        if (this.state.plotData === null)
            return null;

        return (
            <div className="App">
                <h3>Distribution of HRD Scores in Breast Cancer and Ovarian Cancer</h3>
r               <BRCAnessChart plotData={this.state.plotData}/>
            </div>
        );
    }
}

export default App
