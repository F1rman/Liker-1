var a = {
	query: [],
	timeouts: [],
	requests: [],
	sleepTime: 0,
	tries: 0,
	tool: {
		likeIt: function(id, cb){
			a.requests.push($.ajax({
			    url: 'https://www.instagram.com/web/likes/'+id+'/like/',
			    type: 'post',
			    headers: {
			    	'x-csrftoken': data.user.csrf_token
			    }
			}).always(function(e) {
				cb(catcher(function(){
					return e.status == 'ok';
				}))
			}));
		},
		getPost: function(id, cb){
			a.requests.push($.ajax({
			    url: 'https://www.instagram.com/graphql/query/',
			    type: 'get',
			    data: {
			    	query_hash: data.user.post,
					variables: `{"shortcode":"${id}","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":false}`
			    },
			    headers: {
			    	'x-instagram-gis': '2ea69d1677baf9e1d21d4f65f04c16e0'
			    }
			}).always(function(e) {
				// console.log(e)
			    cb(e)
			}));
			
		},
		getRecentTags: function(tag, cb){
			a.requests.push($.get('https://www.instagram.com/explore/tags/'+tag+'/?__a=1').done(function(e){
				cb(catcher(function(){
					return e.graphql.hashtag.edge_hashtag_to_media.edges;
				}))
			}).fail(a.init.bind(!0)))
		}
	},
	// eea84f55093f0b05d58ab25088bbff00
	type: {
		hashtag: function(e){
			if(!e.isEnabled) return;
			var arr = shuffle(e.textarea.trim().replace(' ', '').split('#').slice(1));
			console.log(arr)
			var countLimit = (500-data.feed.length)/arr.length;
			var like1hash = function(tag, limit, cb){
				tag = tag.replace('↵', '').replace(' ', '')
				if(a.sleepTime){
					a.sleepTime--;
					data.status = 'Sleeping';
					timer(like1hash.bind(null, ...arguments), random(180000, 900000));
					return;
				}else{
					data.status = 'Liking: #'+tag;
					a.sleepTime++;
				}

				if(!tag){
					console.log('finished');
					a.init();
					return;
				}
				a.tool.getRecentTags(tag, function(items){
					var liking = function(){
						if(data.feed.length > 500) return a.init(); 
						timer(function() {
							var nextPost = items.shift();
							if(Math.random()>0.75) items.shift();
							a.tool.likeIt(nextPost.node.id, function(res){
								if(res){
									limit--;
									data.feed.push(nextPost.node);
									update();
								}
								(!limit||!items.length)?like1hash(arr.pop(), random(countLimit*0.8, countLimit*1.2)):liking()
							});
						}, random(5000, 12000));
					}
					liking()
				});
			}
			like1hash(arr.pop(), random(countLimit*0.8, countLimit*1.2));
		}
	},
	readyUp: function(){
		$.get('https://www.instagram.com')
		.done(function(e){
			var p = $('<div/>').append(e)
			var p = p.find('script').map(function(el){
				if( $(this).html().includes('window._sharedData = ')){
					var e = JSON.parse( $(this).html().replace('window._sharedData = ', '').slice(0, -1) ) ;
					// console.log(e)
					data.user.csrf_token = e.config.csrf_token
					data.user.username = e.config.viewer.username
					data.user.id = e.config.viewer.id					
				}
				if( this.src.indexOf('dles/base/FeedPageContainer.js/') != -1 ){
					return new Promise((res)=>{
						$.get('https://www.instagram.com'+$(this).attr('src'))
						.done(function(e){
							data.user.comments = e.split('pagination},queryId:"')[1].split('"')[0]
							res()
						})
					})
				}
				if( this.src.indexOf('ndles/base/Consumer.js/') != -1 ){
					return new Promise((res)=>{
						$.get('https://www.instagram.com'+$(this).attr('src'))
						.done(function(e){
							data.user.following = e.split('",l="')[1].split('"')[0]
							data.user.followers = e.split('",l="')[0].split(',s="')[1]
							data.user.post =  e.split('),b="')[1].split('"')[0];
							res()
						})
					})
				}
			}).toArray()
			p.reduce(  (prev, next)=>{return prev.then(next)}, Promise.resolve([])  ).then(()=>a.init());
		})
	},
	init: function(){

		// checking for failures
		if(!this){
			a.tries++;
			if(a.tries < 5){
				a.sleepTime = 0;
			}else{
				a.tries = 0;
			}
		}

		if(data.user.lastDay !== dayToday()){
			data.feed.splice(0, data.feed.length-10);
			data.user.lastDay = dayToday();
			update();
		}

		a.timeouts.forEach(clearTimeout)
		a.requests.forEach(e=>e.abort())
		a.timeouts = []
		a.requests = []

		if(data.feed.length <= 500){
			if(data.tasks.length) a.type[data.tasks[0].type](data.tasks[0]);
		}else{
			console.log('daily quota reached');
			timer(function() {
				a.init()
			}, 60000);
		}
	}
} 
