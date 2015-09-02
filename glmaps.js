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
        this.markers = options.markers || {};
        this.path = options.markers || {};
        
        this.boundSet = 0;
        
        /*Default zoom level*/
        this.zoom = options.zoom || 6;
        
        this.disableDefaultUI = options.disableDefaultUI || false;
        
        this.defaultIcon = '';
        
        this.bounds = [];
        this.map_bounds = [];

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
                disableDefaultUI: this.disableDefaultUI,
//                panControl: false,
//                zoomControl: false,
//                scaleControl: true,
                mapTypeId: GoogleMaps.MapTypeId.ROADMAP,
                streetViewControl: false,
                center: new GoogleMaps.LatLng(this.defaultPosition.latitude, this.defaultPosition.longitude),
            };
                
            this.map = new GoogleMaps.Map(this.container,mapOptions);
            
            this.bounds = new GoogleMaps.LatLngBounds();
            this.map_bounds = new GoogleMaps.LatLngBounds();
            return this;
        },
        
        setMapCenter : function (position) {
            this.map.panTo(position); /*Changed to panTo to enable animation*/
        },

        /*Add Marker to map*/
        addMarkers: function (markersSet, totalCount, keepZoom) {

            markersSet.forEach(this.createMarker.bind(this));
            
            if(totalCount && Object.keys(this.markers).length == totalCount && this.boundSet == 0) {
                this.map.fitBounds(this.bounds);
                this.boundSet = 1;
            }
            
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
            if(!marker.path)
                this.bounds.extend(this.toLatLng(marker.position));
            else 
                this.map_bounds.extend(this.toLatLng(marker.position));
            
            var _marker = new GoogleMaps.Marker({
                icon: marker.icon,
                map: this.map,
                position: this.toLatLng(marker.position)
            });
            
            /*Info Window*/
            if(marker.content != '')
                this.createInfoWindow(marker.content,_marker);
            
            if(!marker.path) {
                this.markers[marker.id] = _marker;
//                this.map.fitBounds(this.bounds);
            }
            else {
                this.path[marker.id] = _marker;
            }
            
            
            
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
            $.each(this.markers, function(key, value){
                value.setMap(map);
            });
        },

        // Removes the markers from the map, but keeps them in the array.
        clearMarkers : function () {
            this.setAllMap(null);
        },
        
        clearPath : function () {
            $.each(this.path, function(key, value){
                value.setMap(null);
            });
        },

//        clearPath : function () {
//            this.path = [];
//        },

        // Shows any markers currently in the array.
        showMarkers : function (map) {
            this.setAllMap(this.map);
        },
        
        // Deletes all markers in the array by removing references to them.
        deleteMarkers : function () {
          this.clearMarkers();
          this.markers = [];
        },
        
        updateMarkerPosition : function (marker,newPosition) {
            marker && marker.setPosition(newPosition);
        },
        
        setBound : function (bound) {
            this.map.fitBounds(this.map_bounds);
//            return 0;
        },
    };

}(google.maps));