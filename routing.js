document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navSection = document.querySelector('.nav-section');
    const body = document.body;
    
    // Initialize 
    navSection.setAttribute('data-visible', 'false');
    
    navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    
        navToggle.setAttribute('aria-expanded', !isExpanded);
    
        navSection.setAttribute('data-visible', !isExpanded);
        
        //  body scroll
        if (!isExpanded) {
            body.classList.add('no-scroll'); 
        } else {
            body.classList.remove('no-scroll');
        }
    });
    
    
    const navLinks = document.querySelectorAll('.nav-section a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024 && navSection.getAttribute('data-visible') === 'true') {
                navToggle.setAttribute('aria-expanded', 'false');
                navSection.setAttribute('data-visible', 'false');
                body.classList.remove('no-scroll');
            }
        });
    });
    
   
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 1024 && 
            navSection.getAttribute('data-visible') === 'true' && 
            !navSection.contains(event.target) && 
            !navToggle.contains(event.target) &&
            !event.target.closest('.nav-section')) {
            
            navToggle.setAttribute('aria-expanded', 'false');
            navSection.setAttribute('data-visible', 'false');
            body.classList.remove('no-scroll');
        }
    });
    
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            navToggle.setAttribute('aria-expanded', 'false');
            navSection.setAttribute('data-visible', 'false');
            body.classList.remove('no-scroll');
        }
    });
});


let map;
let directionsService;
let directionsRenderer;

const routeList = document.getElementById("routes_list");
const resultSection = document.getElementById("results-section");
// map Services and Start Routing process
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 9.0820, lng: 8.6753 }, // Nigeria's approximate center
        zoom: 6, // Zoom out to show entire Nigeria
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: 'roadmap'
    });
directionsService = new google.maps.DirectionsService();
directionsRenderer  = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false
});

const urlParams = new URLSearchParams(window.location.search);
const StartLocation= urlParams.get('start');
const destinationLocation = urlParams.get('destination');

if (StartLocation && destinationLocation) {
    console.log(`Searching for :${StartLocation} to ${destinationLocation}`);
    calculateRoute(StartLocation, destinationLocation); 
}else{
    alert('Error: Start or Destination location is missing from the request');
}
}

function calculateRoute(start, destination) {
    const request= {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'ng',
    };

    routeList.innerHTML = `<p class= "loading-spinner">Calculating routes and fares.....</p>`;
    resultSection.style.display = 'block';

    directionsService.route(request, (response, status) =>{
        if(status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);

            const route = response.routes[0];
            const leg =  route.legs[0];

            const distanceKm = (leg.distance.value /1000).toFixed(2);
            const durationMins= Math.ceil(leg.duration.value /60);
            console.log(`Route Found: ${distanceKm} km, ${durationMins} minutes.`)
            
            const dynamicRoutes = generateDynamicRoutes(distanceKm, durationMins);
            displayResults(start, destination, dynamicRoutes);
        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            routeList.innerHTML = `<p style="color:red; text-align:center;">No road route found for those locations.</p>`;
        } else {
            routeList.innerHTML = `<p style="color:red; text-align:center;">Error: ${status}. Please check your location names.</p>`;
        }
    });
}
    function generateDynamicRoutes(distanceKm, durationMins) {
        const BASE_PRICE = 150;
        const BUS_RATE_PER_KM= 50;
        const OKADA_RATE_PER_KM = 150;
        const TAXI_RATE_PER_KM= 100;

        const dynamicRoutes =[];

        // calculation for bus
        if(distanceKm > 1.5) {
            const busPrice= BASE_PRICE + Math.ceil(distanceKm * BUS_RATE_PER_KM);
            const busDuration = Math.ceil(durationMins*1.5);
            dynamicRoutes.push({
                type: "Bus",
                icon : "🚌",
                price: `₦${busPrice}`,
                duration: `${busDuration}-${busDuration + 10}mins`,
                features: ['Air Conditioner','Multiple stops'],
                color: 'bus'
            });
        }

        //calculations for okada 
        const okadaPrice = BASE_PRICE + Math.ceil(distanceKm* OKADA_RATE_PER_KM);
        const okadaDuration= Math.ceil(durationMins *0.75)
        dynamicRoutes.push({
            type: 'Okada',
            icon: '🛵',
            price: `₦${okadaPrice}`,
            duration: `${okadaDuration} - ${okadaDuration +5}mins`,
            features: ['fastest Option', 'Bypass Traffic'],
            color: 'okadas'
        });

        //calculations for Taxi
        const taxiPrice = BASE_PRICE + Math.ceil(distanceKm * TAXI_RATE_PER_KM);
        const taxiDuration = durationMins+5;
        dynamicRoutes.push({
            type: 'Taxi',
            icon:'🚕',
            price: `₦${taxiPrice}`,
            duration: `${taxiDuration} - ${taxiDuration + 5}mins`,
            features: ['Air Conditioner', 'Comfortable','Direct Route'],
            color: 'taxi'
        })

        return dynamicRoutes.sort((a,b) => {
            const timeA= parseInt(a.duration.split('-')[0].replace('mins', ''));
            const timeB= parseInt(b.duration.split('-')[0].replace('mins', ''));
            return timeA-timeB;
        });
    }

   // In routing.js, replace the displayResults function with this:

function displayResults(start, destination, routes) {
    // First check if the Available element exists
    const availableElement = document.querySelector(".Available");
    if (availableElement) {
        availableElement.textContent = "Available Transport Options";
    }
    
    if (routeList) {
        routeList.innerHTML = `<h3> Routes From ${start} to ${destination} </h3>`;
        routeList.style.color = "#001146";

        if (routes.length === 0) {
            routeList.innerHTML += `<p style="color:red; text-align:center;">No local transport options found for this route.</p>`;
        } else {
            routes.forEach(route => {
                const routeCard = document.createElement('div');
                routeCard.className = 'route-card';
                routeCard.innerHTML = `
                <div class="route-info">
                    <div class="transport-icon ${route.color}">${route.icon}</div>
                    <div class="route-details">
                        <h3>${route.type}</h3>
                        <p>${route.features.join(" • ")}</p>
                    </div>
                </div>
                <div class="route-price">
                    <p class="price">${route.price}</p>
                    <p class="duration">${route.duration}</p>
                </div>
                `;
                routeList.appendChild(routeCard);
            });
        }
    }
    
    if (resultSection) {
        resultSection.style.display = 'block';
    }
}

    document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded');
    
    initLocationButton();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('⚡ DOM already ready');
    initLocationButton();
}

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    return false;
};

// Also add a fallback for Google Maps loading
function gm_authFailure() {
    alert("Google Maps failed to load. Please check your API key.");
    console.error("Google Maps authentication failed");
}
