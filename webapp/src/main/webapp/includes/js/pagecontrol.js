<c:set var="activeTab" value="${empty param.tab ? 'graph' : param.tab}"/>

<script>
/** base url of current object to support loading of data pages **/
var objectUrl = "<c:url value='/${pageType}s/${my:httpEncodeStr(resourceUri.toString())}'/>";

/** store active tab - graph or table, initially populated from either 'tab' param or default to graph**/
var activeTab = "${activeTab}";

/**
 * supports toggling between graph view and table view
 */
function openView(viewname) {
	// Declare all variables
	var i, tabcontent, tablinks;
	
	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(viewname + "view").style.display = "block";
	document.getElementById(viewname + "viewlink").className += " active";
	
	updateUrlParameter('tab', viewname);
}	


/**
 * For pagination, loads batch of records and replaces content of element provided with data retrieved.
 * offset = number of records to offset by
 * pathextension = path to add to end of current object
 * elementId = ID of element to replace innerHtml of
 * urlParamName = name of parameter that will hold the offset value for page bookmark/reload
 */
function loadRecordBatch(offset, pathextension, elementId, urlParamName){
	if (offset==null) {offset==0;}
	if (offset<0) {offset=0;}
	var getUrl = objectUrl+"/" + pathextension + "?offset=" + offset;
	var currUrl = window.location.href;
	if (currUrl.indexOf("/widget")>0){
		getUrl = getUrl + "&view=widget";
	} else if (currUrl.indexOf("/visual")>0) {
		getUrl = getUrl + "&view=visual";
	}
	$.get(getUrl, function( data ) {
		document.getElementById(elementId).innerHTML = data;
	});
	if (offset>0){
		updateUrlParameter(urlParamName, offset);
	} else {
		updateUrlParameter(urlParamName, null);
	}

}
	

/**
 * For pagination, loads batch of graph data and puts it into the graph object
 * offset = number of records to offset by
 * pathextension = path to add to end of current object
 * elementId = ID of element to replace innerHtml of
 * urlParamName = name of parameter that will hold the offset value for page bookmark/reload
 */
function loadGraphBatch(offset, pathextension, elementId, urlParamName){
	if (offset==null) {offset==0;}
	if (offset<0) {offset=0;}
	var getUrl = objectUrl+"/" + pathextension + "?offset=" + offset;
	var currUrl = window.location.href;
	if (currUrl.indexOf("/widget")>0){
		getUrl = getUrl + "&view=widget";
	} else if (currUrl.indexOf("/visual")>0) {
		getUrl = getUrl + "&view=visual";
	}
	$.get(getUrl, function(data) {
		$("#"+elementId).html(data);
		if (typeof drawgraph !== "undefined") { //undefined if graph data not loaded
			drawgraph();
		}
	});

	if (offset>0){
		updateUrlParameter(urlParamName, offset);
	} else {
		updateUrlParameter(urlParamName, null);
	}
}


/** special variation of loadRecordBatch to deal with the popup info box on the graphs.*/
function loadNodeInfoBatch(offset) {
	if (offset==null) {offset==0;}
	if (offset<0) {offset=0;}
	
	var curUrl = window.location.href.split('?')[0];
	
	var getUrl = "<c:url value='/resources/'/>" + encodeURIComponent($("#nodeInfoPopup").data("nodeUri")) + "/nodeinfo" ;
	  
	if (curUrl.indexOf("/resources/")==-1){ 
		//if we are not on a resources page need to also pass in the context URI
		getUrl = getUrl + "/" + encodeURIComponent("${resourceUri}");
	}
	  
	//pass in offset
	getUrl = getUrl + "?offset=" + offset;
	
	//pass in curr view
	if (curUrl.indexOf("/widget")>0){
		getUrl = getUrl + "&view=widget";
	} else if (curUrl.indexOf("/visual")>0) {
		getUrl = getUrl + "&view=visual";
	}
	  
	getUrl = getUrl + "&referer=" + curUrl;
		
	$.get(getUrl, function( data ) {
		document.getElementById("nodeInfoPopup").innerHTML = data;
		});	
}
	
	
/**
 * Allows you to update the URL in the address bar of the browser without reloading 
 * page, this way bookmarks will work on pagination. 
 * param = queryparam you want to update or add to address
 * value = new value of param
 */
var updateUrlParameter = function (key, value) {

    var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
        urlQueryString = document.location.search,
        newParam = key + '=' + value,
        params = '?' + newParam,
        valueIsEmpty = (typeof value == 'undefined') || (value == null) || (value == "null") || (value == '');

    // If the "search" string exists, then build params from it
    if (urlQueryString) {

        updateRegex = new RegExp('([\?&])' + key + '[^&]*');
        removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?');

        if(valueIsEmpty) { // Remove param if value is empty

            params = urlQueryString.replace(removeRegex, "$1");
            params = params.replace( /[&;]$/, "" );

        } else if (urlQueryString.match(updateRegex) !== null) { // If param exists already, update it

            params = urlQueryString.replace(updateRegex, "$1" + newParam);

        } else { // Otherwise, add it to end of query string
            params = urlQueryString + '&' + newParam;

        }
    }
    if (urlQueryString || !valueIsEmpty){
    	window.history.replaceState({}, "", baseUrl + params);
    }
};

/**
 * These do first data load and respond to pagination clicks.
 */
$(window).load(function() {

	// if the graphview block is present, load the graph data
	if ($('#graphview').length>0) {
		var offset = $("#graphview").data("offset");
		loadGraphBatch(offset, "graphdata", "graphview", "gt_offset");
	}
	
	// if the tableview block is present, that means is a graph|table tab page, 
	// activate a tab and load additional data
	if ($('#tableview').length>0) {
		if (activeTab=="graph"){
			document.getElementById("graphviewlink").className += " active";		
		} else {
			openView("table");
		}
		
		var offset = $("#tableview").data("offset");
		loadRecordBatch(offset, "tabledata", "tableview", "tt_offset");
	}
	
	// click actions that cause view change or data load 
	$("#graphviewlink").click(function() {
		openView("graph");
	});

	$("#tableviewlink").click(function() {
		openView("table");
	});
	
	// data table pagination
	$(document).on("click","#tableNext", function() {
		var offset = $("#tableNext").data("offset");
		loadRecordBatch(offset, "tabledata", "tableview", "tt_offset");
	});
	$(document).on("click","#tablePrev", function() {
		var offset = $("#tablePrev").data("offset");
		loadRecordBatch(offset, "tabledata", "tableview", "tt_offset");
	});
		
	// graph data pagination
	$(document).on("click", "#graphNext", function() {
		var offset = $("#graphNext").data("offset");		
		loadGraphBatch(offset, "graphdata", "graphview", "gt_offset");
	});
	$(document).on("click", "#graphPrev", function() {
		var offset = $("#graphPrev").data("offset");
		loadGraphBatch(offset, "graphdata", "graphview", "gt_offset");
	});	
	
	// if the related discos block is present, load data
	if ($('#resourceRelatedDiscos').length>0) {
		var offset = $("#resourceRelatedDiscos").data("offset");
		loadRecordBatch(offset, "discos", "resourceRelatedDiscos", "rd_offset");
	}
	
	// resource related discos pagination
	$(document).on("click","#resourceDiscoPrev", function() {
		var offset = $("#resourceDiscoPrev").data("offset");
		loadRecordBatch(offset, "discos", "resourceRelatedDiscos", "rd_offset");
	});
	
	$(document).on("click","#resourceDiscoNext", function() {
		var offset = $("#resourceDiscoNext").data("offset");
		loadRecordBatch(offset, "discos", "resourceRelatedDiscos", "rd_offset");
	});

	
	// if discos created by agent block present, load data
	if ($('#agentdiscos').length>0) {
		var offset = $("#agentdiscos").data("offset");
		loadRecordBatch(offset, "discos", "agentdiscos", "ad_offset");
	}
	
	// agent related discos pagination
	$(document).on("click","#agentDiscoPrev", function() {
		var offset = $("#agentDiscoPrev").data("offset");
		loadRecordBatch(offset, "discos", "agentdiscos", "ad_offset");
	});
	
	$(document).on("click","#agentDiscoNext", function() {
		var offset = $("#agentDiscoNext").data("offset");
		loadRecordBatch(offset, "discos", "agentdiscos", "ad_offset");
	});
		

	// load node info data
	$(document).on("click","#nodeInfoPrev", function() {
		var offset = $("#nodeInfoPrev").data("offset");
		loadNodeInfoBatch(offset);
	});

	// load node info data
	$(document).on("click","#nodeInfoNext", function() {
		var offset = $("#nodeInfoNext").data("offset");
		loadNodeInfoBatch(offset);
	});		
		
});


</script>