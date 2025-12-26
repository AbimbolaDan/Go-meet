"use strict";

document.addEventListener('DOMContentLoaded', function() {
    console.log("Welcome to my page");
    
    const startForm = document.querySelector(".form");
    const startInput = document.querySelector(".start-input");
    const destinationInput = document.querySelector(".destination-input");
    const SearchBtn = document.querySelector(".search");
    const navToggle = document.querySelector('.nav-toggle');
    const navSection = document.querySelector('.nav-section');
    const body = document.body;
    
    if (navSection) {
        navSection.setAttribute('data-visible', 'false');
    }

    if (navToggle && navSection) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navSection.setAttribute('data-visible', !isExpanded);
        
            if (!isExpanded) {
                body.classList.add('no-scroll'); 
            } else {
                body.classList.remove('no-scroll');
            }
        });
    }
    
    const navLinks = document.querySelectorAll('.nav-section a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024 && 
                navSection && 
                navSection.getAttribute('data-visible') === 'true') {
                
                navToggle.setAttribute('aria-expanded', 'false');
                navSection.setAttribute('data-visible', 'false');
                body.classList.remove('no-scroll');
            }
        });
    });
    
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 1024 && 
            navSection && 
            navSection.getAttribute('data-visible') === 'true' && 
            !navSection.contains(event.target) && 
            navToggle && 
            !navToggle.contains(event.target)) {
            
            navToggle.setAttribute('aria-expanded', 'false');
            navSection.setAttribute('data-visible', 'false');
            body.classList.remove('no-scroll');
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && navToggle && navSection) {
            navToggle.setAttribute('aria-expanded', 'false');
            navSection.setAttribute('data-visible', 'false');
            body.classList.remove('no-scroll');
        }
    });
    function initLocationButton() {
    console.log('🚀 initLocationButton called - looking for location button');
    
    const locateBtn = document.getElementById('locate-start');
    const startInput = document.getElementById('start');
    
    console.log('📍 Button found:', !!locateBtn);
    console.log('📝 Input found:', !!startInput);
    
    if (!locateBtn) {
        console.error('❌ ERROR: Could not find #locate-start button');
        console.log('Make sure your HTML has this button inside the input field');
        return;
    }
    
    if (!startInput) {
        console.error('❌ ERROR: Could not find #start input');
        console.log('Make sure your HTML has: <input type="text" id="start" name="start">');
        return;
    }
    
    console.log('✅ Both elements found! Adding click listener...');
    
    locateBtn.addEventListener('click', function() {
        console.log('🎯 Location button clicked!');
        
        if (!navigator.geolocation) {
            alert("❌ Geolocation is not supported by your browser");
            return;
        }
        locateBtn.classList.add('loading');
        console.log('⏳ Getting location...');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log('📍 Got coordinates:', lat, lng);
                
                getAddressFromCoordinates(lat, lng)
                    .then(address => {
                        console.log('🏠 Got address:', address);
                        startInput.value = address;
                        startInput.focus();
                        console.log('✅ Location set successfully!');
                    })
                    .catch(error => {
                        console.error('❌ Geocoding failed:', error);
                        startInput.value = `My Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                    })
                    .finally(() => {
                        locateBtn.classList.remove('loading');
                    });
            },

            function(error) {
                console.error('❌ Geolocation error:', error);
                locateBtn.classList.remove('loading');
                
                let errorMessage = "Unable to get your location";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "📍 Location access denied. Please allow location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "📍 Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "⏱️ Location request timed out. Please try again.";
                        break;
                }
                
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds
                maximumAge: 60000 // 1 minute
            }
        );
    });
    
    console.log('✅ Click listener added successfully!');
}

function getAddressFromCoordinates(lat, lng) {
    console.log('🌍 Getting address for:', lat, lng);
    
    return new Promise((resolve, reject) => {
        if (window.google && google.maps && google.maps.Geocoder) {
            console.log('🗺️ Using Google Maps Geocoder');
            const geocoder = new google.maps.Geocoder();
            const latlng = { lat: lat, lng: lng };
            
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    console.log('✅ Google Geocoder success:', results[0].formatted_address);
                    resolve(results[0].formatted_address);
                } else {
                    console.log('❌ Google Geocoder failed, trying OpenStreetMap...');
                    fetchOpenStreetMapAddress(lat, lng)
                        .then(resolve)
                        .catch(reject);
                }
            });
        } else {
            console.log('🗺️ Using OpenStreetMap (Google Maps not available)');
            fetchOpenStreetMapAddress(lat, lng)
                .then(resolve)
                .catch(reject);
        }
    });
}
function fetchOpenStreetMapAddress(lat, lng) {
    console.log('🌐 Fetching from OpenStreetMap...');
    
    return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.display_name) {
                console.log('✅ OpenStreetMap success:', data.display_name);
                const parts = data.display_name.split(',').slice(0, 3);
                return parts.join(', ').trim();
            }
            throw new Error('No address found');
        })
        .catch(error => {
            console.error('❌ OpenStreetMap failed:', error);
            return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        });
}
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded, initializing location button...');
    initLocationButton();
});
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('⚡ DOM already ready, initializing now...');
    initLocationButton();
}
    
    function handleSearch(event) {
        event.preventDefault();

        const StartLocation = startInput ? startInput.value.trim() : '';
        const destinationLocation = destinationInput ? destinationInput.value.trim() : '';

        
        if (!StartLocation) {
            alert("Please enter your start Location");
            if (startInput) startInput.focus();
            return;
        }
        
        if (!destinationLocation) {
            alert("Please enter your destination Location");
            if (destinationInput) destinationInput.focus();
            return;
        }

        console.log("Form Submitted!");
        console.log(`Preparing to redirect`);
        
        if (SearchBtn) {
            SearchBtn.textContent = "Searching....";
            SearchBtn.disabled = true;
        }

        const encodeStart = encodeURIComponent(StartLocation);
        const encodedestination = encodeURIComponent(destinationLocation);
        
        setTimeout(() => {
            window.location.href = `result.html?start=${encodeStart}&destination=${encodedestination}`;
        }, 1000);
    }

    if (startForm) {
        startForm.addEventListener("submit", handleSearch);
    }

    if (startInput) {
        startInput.addEventListener("input", function() {
            if (this.value.trim()) {
                this.style.borderColor = "green";
            } else {
                this.style.borderColor = "";
            }
        });
    }

    if (destinationInput) {
        destinationInput.addEventListener("input", function() {
            if (this.value.trim()) {
                this.style.borderColor = "green";
            } else {
                this.style.borderColor = "";
            }
        });
    }
});