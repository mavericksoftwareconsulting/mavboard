/**
 * @author Nathan
 * 
 * File is responsible for modulating the nextrip display functions.
 */

/**
 * Set up an interval that refreshes the marquee content for
 * transit info, every minute.
 */
function displayAllTimes() {
  var marquee = document.getElementById('transit-marquee');
  var stopIDs = [16325, 56001, 56043];

  stopIDs.forEach ((stopID) => {
    refreshTransitTimes(stopID, marquee);

    // Clears container content every time it fires
    setInterval (() => {marquee.innerHTML = ''; refreshTransitTimes(stopID, marquee);}, 60000);
  });
}

/**
 * Function updates a dynamically generated marquee item
 *
 * @param {number} stopID is the id of the transit stop
 * @param {DOM element} marquee is the currently active marquee
 */
function refreshTransitTimes(stopID, marquee) {
  var http = new XMLHttpRequest();


  http.onreadystatechange = () => {
    if (http.readyState == 4 && http.status == 200) {
      var uniqueRoute = [];

      var response = http.responseXML;
      var x = response.getElementsByTagName("NexTripDeparture");

      var content = `<div class="transit-item-wrapper"><li class="transit_stop" id=stop-${stopID}><p>
                        Stop ID: ${stopID}
                     </p></li>`;

      for (var i = 0; i < x.length; i++) {
        var route = x[i].getElementsByTagName('Route')[0];
        route = route.innerHTML;

        if (!uniqueRoute.includes(route)) {
          content += generateDepartureLi(x[i]);

          uniqueRoute.push(route);
        }
      }
      content += "</div>";
      marquee.innerHTML += content;
    }
  };

  var url = "https://svc.metrotransit.org/NexTrip/" + stopID;
  http.open("GET", url, true);
  //http.setRequestHeader('Access-Control-Allow-Headers', '*');
 // http.setRequestHeader('Content-type', '*');
  // http.setRequestHeader('Access-Control-Allow-Origin', '*');
  http.send();
}

/**
 * Given the current departure information, generate a
 * dynamic list item for the marquee.
 */
function generateDepartureLi(departure) {
  var div = "";
  try {
    var depRouteArr = departure.getElementsByTagName('Route');
    var depDirArr   = departure.getElementsByTagName('RouteDirection');
    var depTimeArr  = departure.getElementsByTagName('DepartureText');
    var depDescArr  = departure.getElementsByTagName('Description');

    var depRoute = depRouteArr != null ? depRouteArr[0].innerHTML : 'No Route';
    var depDir   = depDirArr   != null ? depDirArr[0].innerHTML   : 'No Route Direction';
    var depTime  = depTimeArr  != null ? depTimeArr[0].innerHTML  : 'No Departure Time';
    var depDesc  = depDescArr  != null ? depDescArr[0].innerHTML  : 'No Description';

    div += '<li class="dep_trans"><p>';
    div += depRoute + ' ';
    div += depDir;
    div += '</p></li>';

    div += '<li class="dep_desc"><p>' + depDesc + '</p></li>';

    if (depTime.includes('Min')) {
      div += '<li class="dep_time"><p>Next in: ' + depTime + ' </p></li>';
    } else {
      div += '<li class="dep_time"><p>Next at: ' + depTime + '</p></li>';
    }
  } catch (err) {
    console.log(err);
  }
  return div;
}