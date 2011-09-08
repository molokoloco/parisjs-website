(function($){

var log = function() {
    if(this.console) {
        console.log( Array.prototype.slice.call(arguments) )
    }
};

var MONTH = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var ParisJS = {
    ICAL: "http://h2vx.com/ics/www.eventbrite.com/org/862067525"
};

var Spin = { };

Spin.init = function (target) {
    var opts = {
      lines: 12,
      length: 7,
      width: 5,
      radius: 10,
      color: '#FFFFFF',
      speed: 1,
      trail: 100,
      shadow: false
    };

    this.spinner = new Spinner(opts).spin(target);
};

Spin.stop = function () {
    this.spinner.stop();
};

var Meetups = {};

Meetups.init = function() {
    this.load(0);
}

Meetups.load = function(tries) {
    $.ajax({
        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'https%3A%2F%2Fwww.eventbrite.com%2Fxml%2Forganizer_list_events%3Fapp_key%3DOTlkMWFkODNjYThl%26id%3D856075'&format=json&diagnostics=true",
        jsonp: "callback",
        success: function(result) {
            var events = [];
            if (typeof result == "string") {
                result = $.parseJSON(result);
            }
            if (result.query.count === 0 && tries < 2) {
                // Once in a while YQL sends an empty result: try again!
                Meetups.load(tries + 1);
                return;
            }

            if (result.query.count > 0) {
                events = events.concat(result.query.results.events.event);
            }
            var nextEvent = null;

            $(events).each(function(){
                // FIXME (for dev...)
                if (this.status == "Completed") {
                    nextEvent = this;
                    return;
                }
            });
            var $event = $("#event"),
                event;

            if (nextEvent) {
                event = $("#eventTmpl").tmpl({event: nextEvent});
            } else {
                event = $("#eventTmpl").tmpl(
                    {
                        // FIXME
                        event: {
                            description: "toto",
                            url:"#"
                        }
                    }
                );
            }
            $event.html(event);
            Spin.stop();
        }
    });
};

var Utils = {
    formatDate: function(date) {
        try {
            var hour = date.split(" ")[1];
            date = date.split(" ")[0];
            var year = date.split("-")[0];
            var month = date.split("-")[1];
            var day = date.split("-")[2];
            return MONTH[month -1] + " " + day + ", " + year + " "+ hour;
        }catch(err) {
            // FIXME;
            return "&nbsp;";
        }
    }
};

window.Utils = Utils;
window.ParisJS = ParisJS;

$(function() {
    Spin.init($("#event").get(0));
    Meetups.init();
});

})(jQuery);
