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
            PlotData: null
        };
    }

    componentDidMount() {
        // TODO: load the data remotely
        window.HRDScores = HRDScores;
        window.PhenoTypeData = PhenoTypeData;

        // Join the data by sampleID
        let MergedData = join_data(PhenoTypeData, HRDScores);
        window.MergedData = MergedData;


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
            PlotData: MergedData
        });
    }

    render() {
        if (this.state.PlotData === null)
            return null;
        let ovarian_scores =
            this.state.PlotData
                .filter(d => d._primary_disease === "ovarian serous cystadenocarcinoma")
                .map(d => d.HRD);
        return (
            <div className="App">
                <h3>A simple boxplot showing the distribution of HRD score (0-100) in ovarian cancer</h3>
                <Boxplot
                    width={400}
                    height={20}
                    orientation="horizontal"
                    min={0}
                    max={100}
                    stats={computeBoxplotStats(ovarian_scores)}
                />
            </div>
        );
    }
}

export default App
