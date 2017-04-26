/* ===========================================

		RESPONSIVE JSON PORTFOLIO
			CODED BY STEVE LUX

=========================================== */



// -------------- GLOBAL VARS -----------------

var debug = true;

var portList = [];
var portCurrentIndex = 0;
var portImages = [];
var nav_targetY = 0;
var nav_targetID = 0;

var navScrollerTimer;

var stickyPairs = [];

var scrollTable = [];

var loading = true;


// -------------- INIT -----------------

//token jquery ready f
$(document).ready(function () {
	init_loaderMain();
});


//init - check for data load
function init_loaderMain() {

	o('init_loaderMain()');//debugger f

	//if JSON portfolio data isn't loaded into var
	if (das_data == undefined) {
		window.clearTimeout(timeoutID);
		var timeoutID = window.setTimeout(init_loaderMain, 2000);
		return;
	} else {

		//transition into page build
		init();
	}

}//end f



//set up: stick pairs, port items, assign handlers, set current category
function init() {

	o('init()');
	
	window.portCurrent = das_data.categories[0];

	//populate HTMLness
	port_build(das_data);

	//register sticky pairs (layout tweening calc ratios)
	sticky_registerPair($('#header_svg'),$('#nav'),-.05,0,'bottom_right');
	sticky_registerPair($('#header_svg'),$('#port'),0,.3,'right');

	//conditional set resize action
	$(window).resize(function () {
		sticky_updateLayout();
	});

	//init set resize action
	sticky_updateLayout();
	
    //window.timeoutID2 = window.setTimeout(init_dom_ready, 3000);
        
    
    
}//end f

//The top measuremenets for all divs needs to be complete before we can bootstrap the initial active nav item
function init_dom_ready() {

    o('init_dom_ready()');
    
    window.clearTimeout(window.timeoutID2);

    port_setScrollToData();
    data_setScrollTable();
    
    
    scrollHandler($("#port")[0]);
    
    /*
    $('#port').animate(
		{
			scrollTop:1
		},
		"slow"
	);*/
    
    
    //scroll listener
	$("#port").scroll(
		function () { 
			scrollHandler(this);
		}
	);
    
    $(".loading").remove();
    loading = false;
    
    
    
    //$("#portNav0").click();
}


// -------------- PORTFOLIO IN ACTION -----------------


//click/touch handler for nav - toggles CSS, tweens port
function nav_click(obj) {

	console.log('nav_click');
    
    if (loading) { return; }

	nav_setClasses(obj);

	port_animate();
	
}//end f



//does the math/tweening after click so sticky pairs can snap into place
function port_animate() {

	o('port_animate()');

	var nav_domKEY = 'portNav' + portCurrentIndex;
	var port_domKEY = 'port' + portCurrentIndex;

	var navOBJ = $('#'+nav_domKEY);
	var portOBJ = $('#'+port_domKEY);

	var portOBJoffset = $(portOBJ).offset().top;
	var portOffset = $('#port').offset().top;
	var portScrollTop = $('#port').scrollTop();

	//adjust offset
	portOBJoffset = portOBJoffset - portOffset;

	o('port_animate() - portOBJoffset: ' + portOBJoffset);

	portScrollTo = portScrollTop + portOBJoffset;


	$('#port').animate(
		{
			scrollTop:portScrollTo
		},
		"slow"
	);

}//end f


//on scroll e handler
function scrollHandler(obj) {
	
	var check = data_checkThreshold(obj.scrollTop);
	
	//check it against anchor 
	if (check != null) {
			
		o("SET CLASS FOR SCROLL");	
			
		//find matching port id and activate it	
		nav_setClasses($("#"+check.id));
		
		if (check.catSwitch != null) {
			
			var idx = lookupTabIndex(check.catSwitch);
			
			//set nav tab active
			$('#nav').tabs('option','active',[idx]);
				
		}
		
	}//end if
	
}//end f


//used in tab switching
function lookupTabIndex(str) {
	for (var i=0;i<das_data.categories.length;i++) {
		if (str == das_data.categories[i]) {
			return i;	
		}
	}
	
	return null;
}


//see if we've scrolled enough to trigger a nav change
function data_checkThreshold(scroll_num) {

	for (var i=0;i<scrollTable.length;i++) {
	
		var scrollTmp = scrollTable[i].scroll;
			
		if (scroll_num > (scrollTmp - 50) &&
			scroll_num < scrollTmp + 50) {
			
			//o("scrollTmp: " + scrollTmp);
			var obj = scrollTable[i];
			obj.catSwitch = null;
			
			//if the ports don't match...
			if (scrollTable[i].cat != window.portCurrent) {
				obj.catSwitch = scrollTable[i].cat;
			}

			return obj;
						
		}//end if
	
	}//end for
	
	return null;

}//end f



//CSS class swapping on click
function nav_setClasses(obj) {
	var id = $(obj).attr('data-id');
	var catId = $(obj).attr('data-cat');

	//activate nav visually
	$('.nav_item').each(function (i,item) {

		if (item != obj[0]) {
			$(item).removeClass('nav_active');
		} else {
			$(item).addClass('nav_active');
		}

	});//end each

	window.portCurrentIndex = id;
	window.portCurrent = catId;

}//end f




//move stuff
function sticky_closeGap(obj) {

	o('sticky_closeGap()');

	//local vars
	var destX;
	var destY;

	var parentX = $(obj.parent).position().left;
	var parentY = $(obj.parent).position().top;
	var parentWidth = $(obj.parent).width();
	var parentHeight = $(obj.parent).height();
	var parentRight = parentX + $(obj.parent).width();
	var parentBottom = parentY + $(obj.parent).height();

	var childX = $(obj.child).position().left;
	var childY = $(obj.child).position().top;
	var childWidth = $(obj.child).width();
	var childHeight = $(obj.child).width();

	//determine where to stick to
	switch (obj.stickTo) {

		case 'bottom_right':

			destX = parentX + (parentRight - childWidth) + (obj.xOffsetPercent * parentWidth);
			destY = parentBottom + (obj.yOffsetPercent * parentHeight);

		break;

		case 'right':

			destX = parentX + parentWidth + (obj.xOffsetPercent * parentWidth);
			destY = parentY + (obj.yOffsetPercent * parentHeight);

		break;

		default:

			destX = childX;
			destY = childY;

		break;

	}//end switch

	//with jQuery plugin - animate
	new KUTE.Animate(obj.child[0], {
			//options
			from : {
				position: {left:childX,top:childY}
			},
			to  : {
				position: {left:destX,top:destY}
			},
			duration: 500,
			delay   : 0,
			easing  : 'exponentialInOut',
		}
	);
	
}//end f


//init layout retween
function sticky_updateLayout() {

	o('sticky_updateLayout()');
	
	//$('#nav').accordion("refresh");    
	
	if ($('#nav').height() > $('#port').height()) {
		$('#port').height($('#nav').height() + $('#nav').position().top);
	}

	//loop through pairs
	for (var i=0;i<stickyPairs.length;i++) {

		var domPair = stickyPairs[i];

		sticky_closeGap(domPair);

	}
	
}//end f


//additional event for tab clicks - triggers auto scroll to matching content
function tab_clickHandler(obj) {
	
	o("tab clicked");
	
	var category = $(obj).parent().attr('data-cat');
	
	//path to container, then to first child, invoke click f
	var dom_obj = $('#cat_' + category).children().first();
	$(dom_obj).trigger("click");
}


// -------------- PORTFOLIO BUILDING -----------------

function port_build(data) {

	o('port_build()');

	//build the nav categories
	for (var k=0;k<data.categories.length;k++) {
		
		//build nav items for each category
		$('#nav ul').append('<li class="category_' + data.categories[k] + '" data-cat="' + data.categories[k] + '"><a href="#cat_' + data.categories[k] + '">' + data.categories[k] + '</a></li>');
		
		//add a tab click handler
		$('#nav ul li.category_' + data.categories[k]).click(function (e) {			
			tab_clickHandler(e.target);
		});
		
		$('#nav').append('<div id="cat_' + data.categories[k] + '"></div>');
		
		//now go find all my chirens
		for (var i=0;i<data.portfolio.length;i++) {
			
			//he has the mark
			if (data.portfolio[i].category == data.categories[k]) {
			
				//tuck reference into array
				portList.push('port'+i);
		
				var item = port_buildItem(data.portfolio[i],i);
				$('#port').append(item);
		
				//add nav item to div
				$('#cat_' + data.portfolio[i].category).append('<div id="portNav' + i + '" class="nav_item font_body" data-id="' + i + '" data-cat="' + data.portfolio[i].category + '">' + data.portfolio[i].title  + '</div>');
		
				$('#portNav'+i).click(function (e) {
					nav_click(e.target);
				});
				
			}//end if
			
		}//end for
		
	}//end for

	
	$('#nav').tabs();

	nav_setScrollToData();

    
	$('#port').imagesLoaded(function(e){
		port_setScrollToData();
        data_setScrollTable();
    
        scrollHandler($("#port")[0]);
        
        //scroll listener
        $("#port").scroll(
            function () { 
                scrollHandler(this);
            }
        );
    
        $(".loading").remove();
        loading = false;
	});
	

}//end f



//remember scroll locations (tagged on nav items)
function nav_setScrollToData() {

	$('.nav_display').find('.nav_item').each(function(i,obj) {

		var loc = $(obj).offset().top - $(obj).parent().offset().top;
		$(obj).attr('data-loc',loc);

	});

}//end f



//remember scroll data (tagged on portfolio items)
function port_setScrollToData() {

	$('#port').find('.port_item_detail').each(function(i,obj) {

		var loc = ($(obj).offset().top - $(obj).parent().offset().top);

		$(obj).attr('data-loc',loc);

	});


}//end f



//same data - but for faster lookups than DOM walking
function data_setScrollTable() {

	$('.nav_item').each(function(i,obj) {
	
		var id_dom = $(obj).attr('id');
		var id_key = $(obj).attr('data-id');
		var id_cat = $(obj).attr('data-cat');

		var tmp = 
			{
				"id":id_dom, 
				"scroll":$("#port"+id_key).attr('data-loc'),
				"cat":id_cat
			};

		scrollTable.push(tmp);

	});//end each

}//end f



//build out HTML for each port item
function port_buildItem(data,id) {

	o('port_buildItem()');
	
	//local vars
	var portData = data;

	var strength_creative = portData.strength_creative;
	var strength_code = portData.strength_code;
	var images = portData.images;
	var objective = portData.objective;
	var solution = portData.solution;
	var skills = portData.skillset;
	var port_title = portData.title;
	var links = portData.links;


	//clone template
	var tmpItem = $('#hidden').find('.port_item_detail').clone();
	$(tmpItem).attr('id', 'port' + id);

	//set balance
	$(tmpItem).find('.creative_actual').attr('style', 'width:' + (10 * strength_creative) + '%');
	$(tmpItem).find('.coder_actual').attr('style', 'width:' + (10 * strength_code) + '%');

	//set objective
	$(tmpItem).find('.port_item_objective').append('<div class="font_body">' + objective + '</div>');

	//set title
	$(tmpItem).find('.port_item_title').text(port_title);

	//set solution
	for (var j = 0; j < solution.length; j++) {
		$(tmpItem).find('.port_item_solution ul').append('<li class="font_body">' + solution[j] + '</li>');
	}

	//set skills
	$(tmpItem).find('.port_item_skillset > div').append(skills);

	//set images
	for (var j = 0; j < images.length; j++) {
		$(tmpItem).find('.port_item_images').append('<img src="' + images[j] + '"/>');
	}
	
	//set urls
	if (links != undefined) {
		for (var k=0;k<links.length;k++) {
			$(tmpItem).find('.port_item_links ul').append('<a href="' + links[k].url + '" target="_blank">' + links[k].title + '</a><br/>')
		} 
	} else {
		$(tmpItem).find('.port_item_links').remove();
	}

	return tmpItem;

}//end f



//store data for spatial realtionships
function sticky_registerPair(dom1,dom2,xPer,yPer,stickLoc) {
	stickyPairs.push({parent:dom1,child:dom2,xOffsetPercent:xPer,yOffsetPercent:yPer,stickTo:stickLoc});
}



// -------------- TOOLS -----------------

//output f
function o(msg) {
	if (window.debug == true) {
		console.log(msg);
	}
}











//--------------- TRASH I MIGHT NEED TO DUMPSTER DIVE FOR ----------------------

/*
function port_navIncrease() {
	o('port_navIncrease()');
	if (portCurrentIndex<portList.length-1) {
		portCurrentIndex++;
		port_animate();
		port_upCheck();

	}
}


function port_navDecrease() {
	o('port_navDecrease()');
	if (portCurrentIndex>0) {
		portCurrentIndex--;
		port_animate();
		port_upCheck();

	}
}


function port_upCheck() {

	if (portCurrentIndex == 0) {
		port_upOff();
	} else {
		port_upOn();
	}
}


function port_upOff() {
	$('.nav_up').attr('style','opacity:.5');
	$('.nav_up').unbind('click');
}


function port_upOn() {
	$('.nav_up').attr('style','opacity:1');
	$('.nav_up').click(function () {
		o('CLICK UP!');
		port_navDecrease();
	});
}


function port_initControls(){
	$('.nav_up').click(function () {
		o('CLICK UP!');
		port_navDecrease();
	});

	$('.nav_down').click(function () {
		o('CLICK DOWN!');
		port_navIncrease();
	});

	port_upCheck();

}//end f

*/