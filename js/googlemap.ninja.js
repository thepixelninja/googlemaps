/*
 * GOOGLEMAP.NINJA.JS
 * BY ED FRYER
 * THEPIXEL.NINJA
 */

var googleMap = {};

/*----------TESTING----------*/

/*$(document).ready(function(){

    var map = $("#map");
    googleMap.draw(map,"perth",function(map){

        //simply drop a single marker
        googleMap.dropMarker(map,"cottesloe",function(marker){
            console.log(marker);
        });

        //drop a marker with more options and an info window
        googleMap.dropMarker(map,{
            address     : "perth",
            title       : "Here is perth",
            link        : "http://google.com",
            content     : "im the content",
            thumb       : "http://lorempixel.com/200/100",
            infoWindow  : true
        },function(marker){
            console.log(marker);
        });

        //drop several markers at once
        var markers = ["perth","Rottnest Island","cottesloe"];
        googleMap.dropMarkers(map,markers,function(markers){
            console.log(markers);
        });
    });

});*/

/*---------INIT A GOOGLE MAP----------*/

googleMap.init = function(initCallback){

    //if no google
    if(typeof(google) === "undefined"){
        //load script
        googleMap.loadMapScript();
        //save callback
        googleMap.queueCallback(initCallback);
        return false;
    }else{
        //if no google maps
        try{
            var test = new google.maps.Geocoder();
        }catch(e){
            //console.log(e);
            //load script
            googleMap.loadMapScript();
            //save callback
            googleMap.queueCallback(initCallback);
            return false;
        }
    }

    //if all good and loaded then simply run callback
    if(typeof(initCallback) == "function"){
        initCallback();
    }

};

/*---------LOAD THE GOOGLE MAP SCRIPT----------*/

googleMap.loadMapScript = function(){
    clearTimeout(googleMap.loadTimer);
    googleMap.loadTimer = setTimeout(function(){
        $.getScript("http://maps.googleapis.com/maps/api/js?sensor=false&libraries=geometry&callback=googleMap.mapScriptReady");
    },100);
};

/*----------QUEUE A CALLBACK FOR RUNNING ONCE MAPS IS LOADED----------*/

googleMap.queueCallback = function(callback){

    //in no queue callback array the create
    if(!googleMap.callbackQueue){
        googleMap.callbackQueue = new Array();
    }

    //check if the callback is already queued and if not queue it
    if($.inArray(callback,googleMap.callbackQueue) === -1){
        googleMap.callbackQueue.push(callback);
        //console.log("adding");
    }else{
        //console.log("skipping already there");
    }

};

/*----------ONCE THE MAP SCRIPT HAS LOADED----------*/

googleMap.mapScriptReady = function(){

    //loop the queued callbacks and fire them off
    $.each(googleMap.callbackQueue,function(i,callback){
        callback();
        if(i == googleMap.callbackQueue.length-1){
            googleMap.callbackQueue = new Array();
        }
    });

};

/*---------DRAW A MAP----------*/

googleMap.draw = function(el,options,drawCallback){

    //if no height set in css for the map
    var height = el.height();
    if(!height){
        el.css("height",500);
    }

    //make sure we have inited map lib
    googleMap.init(function(){

        //if simply having address as options
        if(typeof(options) == "string"){
            options = {
                address : options,
                zoom    : 10,
                bgColor : "none"
            };
        //else options object is present
        }else{
            //set some defaults
            var defaults = {
                mapTypeId           : google.maps.MapTypeId.ROADMAP,
                zoom                : 10,
                backgroundColor     : "none",
                styles              : [{
                    featureType : "poi",
                    stylers     : [{visibility:"off"}]
                }]
            }
            options = $.extend(defaults,options);
        }

        //if already lat and lng
        if(options.location){

            //create location
            var location = new google.maps.LatLng(options.location[0],options.location[1]);

            //draw map
            draw(location);

        //else geocode
        }else{

            //geocode address
            googleMap.geoCode(options.address,function(location,status){
                //draw map
                draw(location);
            });

        }

    });

    //draw map
    function draw(location){
        //create map
        options.center = location;
        var map = new google.maps.Map(el.get(0),options);
        //fix some styles that mess up the styling of google map
        el.addClass("googleMapNinja").append("<style type='text/css'>.googleMapNinja img { max-width:none; }</style>");
        //callback
        if(typeof(drawCallback) == "function"){
            drawCallback(map,el);
        }
    }

};

/*---------GEOLOCATE AN ADDRESS----------*/

googleMap.geoCode = function(address,geoCallback){

    //make sure we have inited map lib
    googleMap.init(function(){

        //define geocoder
        var geocoder = new google.maps.Geocoder();

        //geocode address
        geocoder.geocode({"address":address},function(results,status){
            if(status == google.maps.GeocoderStatus.OK){
                if(typeof(geoCallback) == "function"){
                    geoCallback(results[0].geometry.location,"success");
                }
            }else{
                if(typeof(geoCallback) == "function"){
                    geoCallback(false,status);
                }
            }
        });

    });

};

/*----------HANDLE DIRECTIONS----------*/

googleMap.directions = function(map,options){

    //if passing a jquery object as the options
    if(options.selector){
        options = {
            form    : options,
            start   : map.center
        }
    }else{
        if(options.start === undefined){
            options.start = map.center;
        }
    }

    //make sure we have inited map lib
    googleMap.init(function(){

        //create the directions service and renderer
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();

        //associate the directions with our map
        directionsDisplay.setMap(map);

        //build the form
        var form = $("\
            <form class='googleMapNinjaForm form-inline' acion='' method='post'>\
                <div class='input-group'>\
                    <input class='form-control' type='text' name='origin' placeholder='Starting Address' required='required'/>\
                </div>\
                <div class='input-group'>\
                    <select class='form-control' name='travelmode'>\
                        <option value='DRIVING'>Driving</option>\
                        <option value='BICYCLING'>Cycling</option>\
                        <option value='TRANSIT'>Public Transport</option>\
                        <option value='WALKING'>Walking</option>\
                    </select>\
                </div>\
                <div class='input-group'>\
                    <button type='submit' class='btn btn-default btn-brand'>Get Directions</button>\
                </div>\
            </form>\
        ");

        //add the form to the page
        if(options.form.hasClass("googleMapNinja")){
            options.form.after(form);
        }else{
            options.form.append(form);
        }

        //add the textual directions to a page
        if(options.directions){
            options.directions.addClass("googleMapNinjaDirections");
        }else{
            options.directions = $("<div class='googleMapNinjaDirections'></div>");
            form.after(options.directions);
        }
        directionsDisplay.setPanel(options.directions.get(0));

        //on click of the submit button
        form.on("submit",function(e){
            e.preventDefault();
            var start = form.find("[name='origin']").val();
            var mode  = form.find("[name='travelmode']").val();
            //get the vals and render directions
            renderDirections({
                origin      : options.start,
                destination : form.find("[name='origin']").val(),
                travelMode  : google.maps.TravelMode[mode]
            });
        });

        //render the directions onto the map
        function renderDirections(request){
            directionsService.route(request,function(result,status){
                //console.log(result,status);
                if(status == google.maps.DirectionsStatus.OK){
                    options.directions.html("");
                    directionsDisplay.setDirections(result);
                }else{
                    options.directions.html("<div class='alert alert-danger'>Sorry, No results found.</div>");
                }
            });
        }

    });

};

/*----------DROP A MARKER----------*/

googleMap.dropMarker = function(map,options,markerCallback){

    //if simply having address as options
    if(typeof(options) == "string"){
        options = {
            title   : options,
            address : options,
            delay   : 1000
        };
        googleMap.geoCode(options.address,function(location,status){
            options.location = location;
            drop(options);
        });
    }else{
        if(!options.location){
            googleMap.geoCode(options.address,function(location,status){
                options.location = location;
                drop(options);
            });
        }else{
            if($.isArray(options.location)){
                options.location = new google.maps.LatLng(options.location[0],options.location[1]);
            }else{
                options.location = new google.maps.LatLng(options.location.lat,options.location.lng);
            }
            drop(options);
        }
    }

    function drop(options){

        //the marker icon
        var color   = options.color || googleMap.randomColor();
        var icon    = options.icon || googleMap.markerImage(color);

        //create the marker
        var marker = new google.maps.Marker({
            position : options.location,
            title    : options.title,
            icon     : icon.image || icon || null,
            //shadow   : icon.shadow || null
        });

        //set marker animation to drop
        marker.setAnimation(google.maps.Animation.DROP);

        //create info window if needed
        if(options.infoWindow){
            googleMap.infoWindow(map,marker,options,function(infoWindow){
                marker.infoWindow = infoWindow;
            });
        }

        //add marker to map
        setTimeout(function(){
            marker.setMap(map);
            marker.dropped = true;
            marker.options = options;
            if(typeof(markerCallback) == "function"){
                markerCallback(marker);
            }
        },options.delay);

    }

};

/*----------CUSTOM MARKER----------*/

googleMap.dropCustomMarker = function(map,options,markerCallback){

    var marker;
    customMarker.prototype = new google.maps.OverlayView();

    //if simply having address as options
    if(typeof(options) == "string"){
        options = {
            title   : options,
            address : options,
            delay   : 1000
        };
        googleMap.geoCode(options.address,function(location,status){
            options.location = location;
            marker = new customMarker(options);
        });
    //else more complex options
    }else{
        if(!options.location){
            googleMap.geoCode(options.address,function(location,status){
                options.location = location;
                marker = new customMarker(options);
            });
        }else{
            if($.isArray(options.location)){
                options.location = new google.maps.LatLng(options.location[0],options.location[1]);
            }else{
                options.location = new google.maps.LatLng(options.location.lat,options.location.lng);
            }
            marker = new customMarker(options);
        }
    }

    //construct a custom marker
    function customMarker(options){
        this.html = options.html || "Hello there!";
        this.div = $("<div class='customMarker'>"+this.html+"</div>");
        this.options = options;
        this.setMap(map);
    }

    //draw the custom marker
    customMarker.prototype.draw = function(){

        var self = this;
        //position the marker
        var panes = this.getPanes();

        //create info window if needed
        if(this.options.infoWindow){
            googleMap.infoWindow(map,self,this.options,function(infoWindow){
                self.infoWindow = infoWindow;
            });
        }

        //on click of marker open an info window if needed
        self.div.on("click",function(){
            if(googleMap.curInfowindow){
                googleMap.curInfowindow.close();
            }
            if(self.infoWindow){
                self.infoWindow.open(map,self)
                self.infoWindow.setPosition(self.options.location);
                googleMap.curInfowindow = self.infoWindow;
            }
            self.div.trigger("markerClicked");
        });

        //add marker to map
        setTimeout(function(){
            panes.overlayImage.appendChild(self.div.get(0));
            var point = self.getProjection().fromLatLngToDivPixel(self.options.location);
            if(point){
                self.div.css({
                    position    : "absolute",
                    top         : point.y,
                    left        : point.x,
                    transform   : "translate(-50%,-100%)"
                })
            }
            self.dropped = true;
            if(typeof(markerCallback) == "function"){
                markerCallback(marker);
            }
        },options.delay);

    }

};

/*----------DROP SEVERAL MARKERS---------*/

googleMap.dropMarkers = function(map,markers,markersCallback,markerCallback){

    //grab the first marker to drop
    var marker = markers.shift();

    //if the marker has been dropped then we are back at the beginning
    if(marker.dropped){
        if(typeof(markersCallback) == "function"){
            markersCallback(markers);
        }
        return false;
    }

    //start the drop loop
    googleMap.dropMarker(map,marker,function(marker){
        markers.push(marker);
        googleMap.dropMarkers(map,markers,markersCallback,markerCallback);
        if(typeof(markerCallback) == "function"){
            markerCallback(marker);
        }
    });

};

/*----------CREATE A MARKER IMAGE----------*/

googleMap.markerImage = function(pinColor){

    pinColor = pinColor.replace("#","");
    var pin = {
        image :
            new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|"+pinColor,
                new google.maps.Size(21,34),
                new google.maps.Point(0,0),
                new google.maps.Point(10,34)
            )
        ,
        shadow :
            new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
                new google.maps.Size(40,37),
                new google.maps.Point(0,0),
                new google.maps.Point(12,35)
            )
    };
    return pin;

};

/*----------INFO WINDOW----------*/

googleMap.infoWindow = function(map,marker,options,infoWindowCallback){

    //set the title
    var title = options.title || "";

    //set the content
    var content = options.content || "";

    //set the link text
    var linkText = options.linkText || "More";

    //set the link
    if(options.link){
        var link = "<a href='"+options.link+"' title='"+title+"' class='btn btn-default btn-brand infoButton'>"+linkText+"</a>";
    }else{
        var link = "";
    }

    //set the thumb
    if(options.thumb){
        var thumb = "<div class='infoThumb'><img src='"+options.thumb+"' alt='"+title+" thumb'/></div>";
    }else{
        var thumb = "";
    }

    //create the html
    var html = "\
        <div class='infoWindow'>\
            <h3 class='infoTitle'>"+title+"</h3>\
            "+thumb+"\
            <div class='infoContent'>"+content+"</div>\
            "+link+"\
        </div>\
    ";

    //create the info window
    var infowindow = new google.maps.InfoWindow({
        content     : html,
        maxWidth    : 300
    });

    //open the window on click
    google.maps.event.addListener(marker,"click",function(){
        if(googleMap.curInfowindow){
            googleMap.curInfowindow.close();
        }
        infowindow.open(map,marker);
        googleMap.curInfowindow = infowindow;
    });

    //callback
    if(typeof(infoWindowCallback) == "function"){
        infoWindowCallback(infowindow);
    }

};

/*----------GET THE DISTANCE BETWEEN TWO MARKERS----------*/

googleMap.distanceBetween = function(marker1,marker2){

    var pos1 = marker1.getPosition();
    var pos2 = marker2.getPosition();
    var dist = google.maps.geometry.spherical.computeDistanceBetween(pos1,pos2);
    return dist;

};

/*----------GET A RANDOM COLOR----------*/

googleMap.randomColor = function(){
    var color = "#"+Math.floor(Math.random()*16777215).toString(16);
    if(color.length == 6){
        color = color+"0";
    }
    return color;
};
