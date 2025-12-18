let outputChart, operatorChart, ganttChart;

function recalculate() {

  // -------- INPUTS --------
  const machines = +machinesInput.value;
  const shiftSec = +shiftHours.value * 3600;
  const days = +daysInput.value;
  const componentsTray = +componentsTrayInput.value;
  const machineTime = +machineTimeInput.value;
  const operatorTime = +operatorTimeInput.value;
  const trays = +traysInput.value;

  // -------- CALCULATIONS --------
  const componentsShift = machines * trays * componentsTray;
  const componentsDay = componentsShift * 3;
  const componentsMonth = componentsDay * days;

  const operatorEngaged = operatorTime * trays * machines;
  const operatorIdle = shiftSec - operatorEngaged;

  results.innerHTML = `
    <b>Components / Shift:</b> ${componentsShift}<br>
    <b>Components / Day:</b> ${parseInt(componentsDay)}<br>
    <b>Components / Month:</b> ${parseInt(componentsMonth)}<br><br>
    <b>Operator Engaged Time / Shift:</b> ${parseInt(operatorEngaged)} sec <br> or <br> ${parseInt(operatorEngaged) / 60} min 
    <b>Operator Idle Time / Shift:</b> ${parseInt(operatorIdle)} sec <br> or <br> ${parseInt(operatorIdle) / 60} min
  `;

  // -------- OUTPUT CHART --------
//   outputChart?.destroy();
//   outputChart = new Chart(outputChartCanvas, {
//     type: 'bar',
//     data: {
//       labels: ['Per Shift', 'Per Day', 'Per Month'],
//       datasets: [{
//         label: 'Components',
//         data: [componentsShift, componentsDay, componentsMonth],
//         backgroundColor: '#4f81bd'
//       }]
//     },
//     options: { responsive: true }
//   });

outputChart?.destroy();
outputChart = new Chart(outputChartCanvas, {
  type: 'bar',
  data: {
    labels: ['Per Shift', 'Per Day', 'Per Month'],
    datasets: [{
      label: 'Components',
      data: [componentsShift, componentsDay, componentsMonth],
      backgroundColor: '#4f81bd'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: value => value.toLocaleString()
      }
    }
  },
  plugins: [ChartDataLabels]
});

  // -------- OPERATOR UTILIZATION --------
//   operatorChart?.destroy();
//   operatorChart = new Chart(operatorChartCanvas, {
//     type: 'pie',
//     data: {
//       labels: ['Engaged (sec)', 'Idle (sec)'],
//       datasets: [{
//         data: [operatorEngaged, operatorIdle],
//         backgroundColor: ['#f4b183', '#c5c5c5']
//       }]
//     }
//   });

operatorChart?.destroy();
operatorChart = new Chart(operatorChartCanvas, {
  type: 'pie',
  data: {
    labels: ['Engaged (sec)', 'Idle (sec)'],
    datasets: [{
      data: [operatorEngaged, operatorIdle],
      backgroundColor: ['#f4b183', '#c5c5c5']
    }]
  },
  options: {
    plugins: {
      datalabels: {
        color: '#000',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        }
      }
    }
  },
  plugins: [ChartDataLabels]
});


  // -------- CORRECT 8-HOUR MACHINE GANTT --------
  ganttChart?.destroy();

const labels = [];
const datasets = [];

// Color palette per machine
const machineColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
const operatorColors = ['#aec7e8', '#aec7e8', '#aec7e8', '#aec7e8'];

// Dynamic initial offsets (visual staggering)
const baseOffset = 200;

for (let m = 0; m < machines; m++) {

  const machineLabel = `Machine ${m + 1}`;
  labels.push(machineLabel);

  let timeCursor = m * baseOffset;

  const operatorBars = [];
  const machineBars = [];

  for (let t = 1; t <= trays; t++) {

    // Operator load
    const loadStart = timeCursor;
    const loadEnd = loadStart + operatorTime;

    operatorBars.push({
      x: [loadStart, loadEnd],
      y: machineLabel
    });

    // Machine run
    const runStart = loadEnd;
    const runEnd = runStart + machineTime;

    machineBars.push({
      x: [runStart, runEnd],
      y: machineLabel
    });

    timeCursor = runEnd;
  }

  // Operator dataset for this machine
  datasets.push({
    label: `Operator – ${machineLabel}`,
    data: operatorBars,
    backgroundColor: operatorColors[m % operatorColors.length],
    barThickness: 12
  });

  // Machine dataset for this machine
  datasets.push({
    label: `Running – ${machineLabel}`,
    data: machineBars,
    backgroundColor: machineColors[m % machineColors.length],
    barThickness: 12
  });
}

ganttChart = new Chart(ganttChartCanvas, {
  type: 'bar',
  data: {
    labels,
    datasets
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        min: 0,
        max: shiftSec,
        title: {
          display: true,
          text: 'Time (seconds – 8 Hour Shift)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx =>
            `${ctx.dataset.label}: ${ctx.raw.x[1] - ctx.raw.x[0]} sec`
        }
      }
    }
  }
});

}

// -------- DOM --------
const [
  machinesInput, shiftHours, daysInput, componentsTrayInput,
  inspectionInput, machineTimeInput, operatorTimeInput, traysInput
] = document.querySelectorAll('input');

const outputChartCanvas = document.getElementById('outputChart');
const operatorChartCanvas = document.getElementById('operatorChart');
const ganttChartCanvas = document.getElementById('ganttChart');

recalculate();




