//colors in star when user favs
function toggleStar(star) {
    $(star).addClass("fa-star").removeClass("fa-star-o");
}

var harp = {
    $content: $('.content'),
    $fav: $('.placeholder'),
    $form: $('form'),
    userInput: '',
    userInputIsValid: false,
    appId: '',

    toggleLoading: function(){
        // Toggle loading indicator
        this.$content.toggleClass('content--loading');

        // Toggle the submit button so we don't get double submissions
        this.$form.find('button').prop('disabled', function(i, v) { return !v; });
    },

    throwError: function(header, body){
        // Remove animation class
        this.$content.removeClass('content--error-pop');

        // Trigger reflow
        this.$content[0].offsetWidth = this.$content[0].offsetWidth;

        // Add classes and content
        this.$content
            .html('<p><strong>' + header + '</strong> ' + body + '</p>')
            .addClass('content--error content--error-pop');

        this.toggleLoading();
    },

    validate: function() {
        
        if (this.userInput !== null || this.userInput !== undefined) {
            this.userInputIsValid = true;
            
            var artistName = this.userInput.replace(/ /g, "+");
            this.appId = artistName;
        } else {
            this.userInputIsValid = false;
            this.appId = '';
        }
    },

    render: function(response){
        // Get ALL responses
        var responseLength = response.results.length,
            track='';
        
        harp.$content.html(this).append('<ul/>');
        
        for (var index=0; index < responseLength; index++) {

            var trackLevel = response.results[index],
                trackDuration = trackLevel.trackTimeMillis;
            
            //don't show non-songs from response
            if(trackLevel.kind !== "song") return;
            
            //convert duration to digital clock
            var mins = Math.floor((trackDuration % 3600000) / 60000),
                secs = Math.ceil(((trackDuration % 360000) % 60000) / 1000);
            //add '0' in front of number if secs is < 10
            if (secs<10) {
                secs = '0'+secs;
            }
            
            //human readable time
            trackDuration = mins + ":" + secs;
            
                track += "<li><span class='title'><img src='"+trackLevel.artworkUrl30+"'> <a href='javascript:void(0)' onclick=''>"
                         +trackLevel.trackName+"</a></span><span class='artist'>"+trackLevel.artistName+"</span><span class='time'>"+trackDuration+"</span><span class='controls'><i class='fa fa-play'></i><i class='fa fa-star-o'onclick='toggleStar(this)'></i></span></li>";
            
            harp.$content.html(this).append(track).removeClass('content--error');
        }
        $(".wrapper").show();
        harp.toggleLoading();
    }
};


$(document).ready(function(){
    
    $(".wrapper").hide();
    
    

    harp.$form.keyup(function(e){
        e.preventDefault();
        harp.toggleLoading();
        harp.userInput = $(this).find('input').val();
        harp.validate();

        if( harp.userInputIsValid ) {
            
            $.ajax({
                url: "https://itunes.apple.com/search?term=" + harp.appId,
                dataType: 'JSONP'
            })
            .done(function(response) {
                
                // Check to see if request is valid & contains the info we want
                // If it does, render it. Otherwise throw an error
                if(response !== null && response.results.length > 0){
                    harp.render(response);
                } else {
                    harp.throwError(
                        'Invalid Artist',
                        'The artist you are searching for is not in the iTunes library. <br> Try a different artist.'
                    );
                }
            })
            .fail(function(data) {
                harp.throwError(
                    'iTunes API Error',
                    'There was an error retrieving the info. Check your spelling or try again later.'
                );
            });
        } else {
            harp.throwError(
                'Invalid',
                'You must submit an artist that exists.'
            );
        }
    });
        
});