
import React from 'react';
import './BRCAnessChart.css';
import {scaleLinear} from 'd3-scale';
import {extent as d3Extent, min as d3Min, max as d3Max, sum as d3Sum} from 'd3-array'
import {histogram as d3Hist} from 'd3-array'


class Group extends React.Component {
    render() {
        let {x = 0, y = 0, children, ...props} = this.props;
        return (
            <g transform={`translate(${x}, ${y})`} {...props}>{children}</g>
        )
    }
}

class BRCAnessChart extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            svg_width: 800,
            svg_height: 800,
            // I will assume top === bottom
            margin: {top: 50, bottom: 50, left: 50, right: 50, middle: 30}
        }
    }

    render() {
        let plotData = this.props.plotData;
        let {svg_width, svg_height, margin} = this.state;

        const scores_bottom = plotData
            .filter(d => d._primary_disease === "ovarian serous cystadenocarcinoma")
            .map(d => d.HRD);
        const scores_top = plotData // TODO: data should come from user
            .filter(d => d._primary_disease === "breast invasive carcinoma")
            .map(d => d.HRD);

        let scaleX = scaleLinear()
            // FIXME: calcuate the extent manually
            //.domain(d3Extent(scores_top.concat(scores_bottom)))
            .domain([0, 100])
            .range([0, svg_width - margin.left - margin.right])
            .nice();

        let convertHist = function(values) {
            let hist = d3Hist()
                .domain(scaleX.domain())
                .thresholds(scaleX.ticks(20));
            let ans = hist(values);
            let sum_length = d3Sum(ans, d => d.length)
            for (let each of ans)
                each.percent = each.length/sum_length;
            return ans;
        }
        let hist_bottom = convertHist(scores_bottom);
        let hist_top    = convertHist(scores_top);


        let scaleY = scaleLinear()
            .domain([0, d3Max(hist_bottom.concat(hist_top), d => d.percent)])
            .range([svg_height/2 - margin.top - margin.middle, 0])
            .nice();

        return (
           <svg className="BRCAnessChart" width={svg_width} height={svg_height}>
               <Group x={margin.left} y={margin.top}>
                   <Histogram
                       data={hist_top}
                       inverted={false}
                       width={svg_width-margin.left-margin.right}
                       height={svg_height/2 - margin.top - margin.middle}
                       scaleX={scaleX}
                       scaleY={scaleY}
                   />
               </Group>

               <Group x={margin.left} y={svg_height/2 + margin.middle}>
                   <Histogram
                       data={hist_bottom}
                       inverted={true}
                       width={svg_width- margin.left - margin.right}
                       height={svg_height/2 - margin.top - margin.middle}
                       scaleX={scaleX}
                       scaleY={scaleY}
                   />
               </Group>
           </svg>
        );
    }
}

class Histogram extends React.Component {
    render() {
        let {data, inverted, width, height, scaleX, scaleY, ...props} = this.props;
        if (inverted) {
            scaleY = scaleY.copy()
            scaleY.range([scaleY.range()[1], scaleY.range()[0]])
        }
        let rects = data.map(d => {

            let x = scaleX(d.x0);
            let width = scaleX(d.x1) - x;
            let y = d3Min([scaleY(0), scaleY(d.percent)]);
            let height = d3Max([scaleY(0), scaleY(d.percent)]) - y;

            return (
                <rect x={x} y={y} width={width} height={height} fill="grey" key={x}></rect>
            )
        })
        return (
            <Group>
                {rects}
            </Group>
        )
    }
}

export default BRCAnessChart

