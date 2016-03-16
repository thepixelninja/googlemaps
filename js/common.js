/*----------TESTING----------*/

$(document).ready(function(){

    //grab the map
    var $maps = $(".googleMap");

    //the options
    var options = {
        address     : "Perth" //where to center the map
    }

    $maps.each(function(){

        var $map = $(this);

        //draw the map
        googleMap.draw($map,options,function(map,holder){

            //simply drop a single marker
            googleMap.dropMarker(map,"Cottesloe",function(marker){
                console.log(marker);
            });

            //drop a marker with more options and an info window
            googleMap.dropMarker(map,{
                address     : "Perth",
                title       : "Here is Perth",
                link        : "http://google.com",
                linkText    : "Click me",
                content     : "Im the content",
                thumb       : "http://lorempixel.com/200/100",
                infoWindow  : true
            },function(marker){
                console.log(marker);
            });

            //drop several markers at once
            var markers = ["east fremantle","Rottnest Island","fremantle"];
            googleMap.dropMarkers(map,markers,function(markers){
                console.log(markers);
            });

            //initiate directions
            googleMap.directions(map,{
                form    : holder,
                start   : "Perth"
            });

        });

    });

});
