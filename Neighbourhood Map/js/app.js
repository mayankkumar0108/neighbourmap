var locations = [{
        title: 'Gir Forest National Park',
        location: {
            lat: 21.1243,
            lng: 70.8242,
        },
        show: true,
        selected: false,
        id: '4ce40d96dc85a1432f6b49d2'
    },
    {
        title: 'Dwarkadhish Temple',
        location: {
            lat: 22.2376,
            lng: 68.9674,
        },
        show: true,
        selected: false,
        id: '4ce5638b5bf68cfa6aa13c17'
    },
    {
        title: 'Sabarmati Ashram',
        location: {
            lat: 23.0608,
            lng: 72.5809,
        },
        show: true,
        selected: false,
        id: '4e4654a3b61c03d0cd09dd6a'
    },
    {
        title: 'Kankaria Lake',
        location: {
            lat: 23.0063,
            lng: 72.6026,
        },
        show: true,
        selected: false,
        id: '4bcfe581a8b3a593831c635f'
    },
    {
        title: 'Lothal',
        location: {
            lat: 22.5227,
            lng: 72.2488,
        },
        show: true,
        selected: false,
        id: '4bcfe581a8b3a593831c635f'
    }
];
var markers = [];
var ViewModel = function() {
    var largeInfowindow = new google.maps.InfoWindow();
    for (var j = 0; j < locations.length; j++) {
        var defaultIcon = makeMarkerIcon('0091ff');
        var highlightedIcon = makeMarkerIcon('FFFF24');
        var marker = new google.maps.Marker({
            map: map,
            position: locations[j].location,
            title: locations[j].title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            show: ko.observable(locations[j].show),
            selected: ko.observable(locations[j].selected),
            venue: locations[j].id,
        });
        likes: '';
        rating: '';
        markers.push(marker);

        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
        //color will change when it is clicked.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            drop(this);
        });
    }

    function drop(marker) {
        marker.setAnimation(google.maps.Animation.DROP);
        marker.setIcon(highlightedIcon);
        setTimeout(function() {
            marker.setAnimation(null);
            marker.setIcon(defaultIcon);
        }, 760);
        populateInfoWindow(marker, largeInfowindow);
    }
    this.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 760);
        populateInfoWindow(marker, largeInfowindow);
    };

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    infowindow.setContent('<div>' + marker.title + '<br>' + marker.rating + '<br>' + marker.likes + '</div><div id="pano">+</div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // info window is opened
            infowindow.open(map, marker);
        }
    }
    this.search = ko.observable('');
    this.filterText = function() {
        var type = this.search();
        largeInfowindow.close();
        if (type.length === 0) {
            this.setAllShow(true);
        } else {
            for (var k = 0; k < markers.length; k++) {
                if (markers[k].title.toLowerCase().indexOf(type.toLowerCase()) >= 0) {
                    markers[k].show(true);
                    markers[k].setVisible(true);
                } else {
                    markers[k].show(false);
                    markers[k].setVisible(false);
                }
            }
        }
        largeInfowindow.close();
    };
    this.setAllShow = function(marker) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].show(marker);
            markers[i].setVisible(marker);
        }
    };

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }
    markers.forEach(function(marker) {
        $.ajax({
            method: 'GET',
            dataType: 'json',
            url: 'https://api.foursquare.com/v2/venues/' + marker.venue + '?client_id=DCEKGIKZMVWFQGUBIPG1UFVQHBBQ2WFF4QUOKDSQRECE21JG&client_secret=M0ZMUJIHFL5Y2O0B40TIJ4VZ2PISMZ4EEVPMLR41UBDR1ASL&v=20170429',
            success: function(data) {
                var request = data.response.venue;
                marker.rating = request.rating;
                if (request.hasOwnProperty('rating') != '') {} else {
                    marker.rating = "Rating NOT Found";
                }
                if (request.hasOwnProperty('likes') != '') {
                    marker.likes = request.likes.summary;
                } else {
                    marker.likes = 'Likes Not Found';
                }
            },
            error: function(e) {
                alert("Error loading in foursquare");
            }
        });
    });
};
