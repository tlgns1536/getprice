function getInfo() {
	const requestBtc = new Request(`/get/btc/history`);
  fetch(requestBtc)
  .then(function(result) {
    result.json()
    .then(function(res) {
      const rowData = [];
      res.forEach(function(object) {
        if (object.error === 'none' ) {
					const date = new Date(object.time * 1000);
          rowData.push([date, Number(object.price), object.price]);
        }
      });
			drawChart(rowData, 'BTC', res[res.length -1].error);
		});
	});
	const requestXrp = new Request(`/get/xrp/history`);
  fetch(requestXrp)
  .then(function(result) {
    result.json()
    .then(function(res) {
      const rowData = [];
      res.forEach(function(object) {
        if (object.error === 'none' ) {
					const date = new Date(object.time * 1000);
          rowData.push([date, Number(object.price), object.price]);
        }
      });
			drawChart(rowData, 'XRP', res[res.length -1].error);
		});
	});
};

function drawChart(dataArray, name, err) {
  const data = new google.visualization.DataTable();
  data.addColumn('date', 'time');
  data.addColumn('number', `${name}`);
  data.addColumn({type: 'string', role: 'annotation'});
  data.addRows(dataArray);
  const options = {
    title: `${name} PRICE`,
    colors: ['blue'],
    displayAnnotations: true,
    width: '100%',
    height: 400,
    zoomStartTime: new Date(new Date().getTime() - 1000 * 60 *10)
  };
  if (name === 'XRP') {
    options.colors = ['red'] ;
  }
  const chartElement = document.getElementById(`linechart_${name}`);
  const newChart = new google.visualization.AnnotationChart(chartElement);
  newChart.draw(data, options);
//window.scrollTo(chartElement.childNodes[0].scrollWidth, 0);
}

