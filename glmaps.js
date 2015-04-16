;
(function (GoogleMaps) {
    'use strict';
    
    var Glmaps = window.Glmaps = function (options) {
        /*Map Container*/
        this.container = document.getElementById(options.container);
        
        this.defaultLocationByName = options.defaultLocationByName;
        /*Default Position : Can be blank  Default will be 0,0*/
        this.defaultPosition = options.defaultPosition;
        /*Default Markers : Can be blank*/
        this.markers = options.markers;
        /*Default zoom level*/
        this.zoom = 6;
        
        this.defaultIcon = '';

        return this.init();
    };

    Glmaps.prototype = {
        
        /*Initialize map*/
        init: function () {
            return this
                .createMap()
                ;
        },
        
        /*Creating map*/
        createMap: function () {
            
            var mapOptions = {
                zoom: this.zoom,
//                disableDefaultUI: true,
//                panControl: false,
//                zoomControl: false,
//                scaleControl: true,
                mapTypeId: GoogleMaps.MapTypeId.TERRAIN,
                streetViewControl: false,
                center: new GoogleMaps.LatLng(this.defaultPosition.latitude, this.defaultPosition.longitude),
            };
                
            this.map = new GoogleMaps.Map(this.container,mapOptions);
            return this;
        },
        
        setMapCenter : function (position) {
            this.map.setCenter(position);
        },

        /*Add Marker to map*/
        addMarkers: function (markersSet) {
            markersSet.forEach(this.createMarker.bind(this));
            return this;
        },

        /*User created marker*/
        createUserMarker: function () {
            var marker = this.userMarker = this.createMarker({
                position: this.defaultPosition
            });

            marker.setClickable(false);
            return this;
        },
        
        /*Create new marker*/
        createMarker: function (marker) {            
            var marker = new GoogleMaps.Marker({
                icon: marker.icon,
                map: this.map,
                position: this.toLatLng(marker.position)
            });
            this.markers.push(marker);
            
            this.createInfoWindow(marker.icon,marker);
            return marker;
        },
        
        createInfoWindow: function (content,marker) {
            
            var infowindow = new GoogleMaps.InfoWindow({
                content: content,
                maxWidth: 300
            });
            
            GoogleMaps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.open(this.map, marker);
                }
            })(marker));
        },

        /*Google Position Object*/
        toLatLng: function (position) {
            return position instanceof GoogleMaps.LatLng ?
                position : new GoogleMaps.LatLng(position.latitude, position.longitude);
        },
        
        /*Panning to specefic point*/
        panToPosition: function (position) {
            this.map.panTo(this.toLatLng(position));
            return this;
        },

        /*Initial Position setup*/
        setInitialPosition: function (position) {
            var initialPosition = this.initialPosition = this.toLatLng(position.coords);

            this.map.setCenter(initialPosition);

            this.userMarker.setPosition(initialPosition);

            return this.panToPosition(initialPosition);
        },
        
        /*Getting user current location*/
        getUserPosition: function () {
            if ('geolocation' in navigator)
                navigator.geolocation.getCurrentPosition(
                    this.setInitialPosition.bind(this), this.handleUserPositionError.bind(this), {
                        enableHighAccuracy: true,
                        timeout: 6000
                    }
                );

            return this;
        },

        /*If user location not found.*/
        handleUserPositionError: function () {
            return this.notify('Initial location not found.');
        },
        
        getGeoLocation : function () {
            
            this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode( { 'address': this.defaultLocationByName}, function(results, status) {

                /*If geocode is success*/
                if (status == google.maps.GeocoderStatus.OK) {
                    /*Set map center*/
                    map.setCenter(results[0].geometry.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        },
        
        /*Simple notify TODO : Change it with something generic */
        notify: function (message) {
            var container = this.container,
                warning = document.createElement('p');

            warning.innerHTML = message;

            container.appendChild(warning);

            return this;
        },
        
        /*Remove , refresh operations*/
        
        setAllMap : function (map) {
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(map);
            }
        },

        // Removes the markers from the map, but keeps them in the array.
        clearMarkers : function () {
            this.setAllMap(null);
        },

        clearPath : function () {
            this.path = [];
        },

        // Shows any markers currently in the array.
        showMarkers : function (map) {
          this.setAllMap(map);
        },
        
        // Deletes all markers in the array by removing references to them.
        deleteMarkers : function () {
          this.clearMarkers();
          this.markers = [];
        },        
    };

}(google.maps));