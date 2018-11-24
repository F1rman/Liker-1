var data = {
	tasks: [],
	feed: [],
	user: {
		lastDay: dayToday()
	},
	status: 'Sleeping'
}











chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.why) {
	    case 'getData':
	        sendResponse(data);
	        break;
	    case 'setData':
	    	data.tasks = request.data.tasks;
	    	a.init();
	    	update();
	        sendResponse(!0);
	        break;
	    default:
	        console.log('nothing');
	}
});


chrome.storage.local.get(["data"], function(items) {
	console.log(items)
    if (items.data) {
    	data = items.data;
    }else{
    	update()
    }
    a.readyUp();
});