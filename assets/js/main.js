//Add songs to Fav Section
//toggle colors in star when user favs
function toggleStar(star) {
    $(star).toggleClass("fa-star fa-star-o");
    var $li = $(star).closest("li");
    
    if ($li.hasClass("favd")) {
        $li.hide().addClass("delete");
    }
    
    //copy fav'd track to favorite section
    //remove track from main content area
    $li.clone().appendTo("ul.placeholder").addClass("favd");
    $li.remove();
    
    //change placeholder style to match main content area
    $("ul.placeholder").css( "font-style", "normal" ).css( "color", "#000" );
    
    //hide placeholder text
    $(".placeholder-text").html("<h2>Starred</h2>");
    
    
}

//toggle play/pause of track
function toggleControls(play) {
    
    var currTrack = play.id,
        play_pause=true;
    if (currTrack.indexOf("apppppppp") >= 0) {
        currTrack = currTrack.replace(/\apppppppp/g, "'");
    }
    
    
    //if you want to stop this track from playing
    if ($(play).hasClass("fa-pause")){
        $(play).addClass("fa-play").removeClass("fa-pause");
        play_pause=false;
    } else { //if you want to stop another traack from playing and play this track
        $(".fa-pause").addClass("fa-play").removeClass("fa-pause");
        $(play).toggleClass("fa-play fa-pause");
    }
    
    nowPlaying (currTrack,play_pause);
}

//show what is playing
//Also stop showing when paused
function nowPlaying (currTrack,play_pause) {
    //if playing: play_pause=true
    //if not: play_pause=false
    if (play_pause){
        play_pause = 'playing';
    } else {
        play_pause = 'paused';
    }
    
    console.log(currTrack+" is "+play_pause);
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
            console.log("here");
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
                        
            //convert duration to digital clock
            var mins = Math.floor((trackDuration % 3600000) / 60000),
                secs = Math.ceil(((trackDuration % 360000) % 60000) / 1000);
            //add '0' in front of number if secs is < 10
            if (secs<10) {
                secs = '0'+secs;
            }
            
            //human readable time
            trackDuration = mins + ":" + secs;
            var currTrack = trackLevel.trackName;
            
            if(currTrack!==undefined){
                var currTrackId = currTrack.replace(/\'/g, 'apppppppp');
            }
                
            
                track += "<li><span class='title'><img src='"+trackLevel.artworkUrl30+"'> <a href='javascript:void(0)' onclick=''>"
                         +currTrack+"</a></span><span class='artist'>"+trackLevel.artistName+"</span><span class='time'>"+trackDuration+"</span><span class='controls'><i id='"+currTrackId+"' class='fa fa-play' onclick='toggleControls(this)'></i><i class='fa fa-star-o' onclick='toggleStar(this)'></i></span></li>";
            
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
                
        if (harp.userInput === "" || harp.userInput === " "){
            $(".main").hide();
            //console.log("empty");
        } else{
            $(".main").show();
        }

        if( harp.userInputIsValid ) {
            
            //show name of track on top of main section
            $(".title-track").html("<h2>"+harp.userInput+"</h2>").css("text-transform", "capitalize");
            
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