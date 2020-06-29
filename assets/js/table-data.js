$(function(e) {
	$('#tabla').DataTable({
		"searching": false,
		"paging":   false,
	    "bInfo": false,
	    "bScrollInfinite": true,
        "bScrollCollapse": true,
        "ordering": false,
        "sScrollY": "150px",
        "columnDefs": [
    { "width": "8%", "targets": 2 }
  ]
	});
});