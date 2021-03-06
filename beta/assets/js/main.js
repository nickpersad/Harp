/*

    Vision Forward Marketing LLC (2015)

    <p>Description: Search and play music anywhere. Main JS file.</p>

    @author Nick Persad
    @version 0.1

*/


//soundcloud api client ID
var sc_client_ID="?client_id=9f6727ade08abf47a14de3088db459ad";
// variable to store HTML5 audio element
var music = document.getElementById('music');

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
    $(".placeholder-text").html("<h2>Starred Playlist</h2>");
    
    
}

//toggle play/pause of track
function toggleControls(play,time,stop) {
    
    var currTrack = play.id,
        play_pause=true;
    
    
    if (currTrack.indexOf("apppppppp") >= 0) {
        currTrack = currTrack.replace(/\apppppppp/g, "'");
    }
    
    //if you want to stop this track from playing
    if ($(play).hasClass("fa-pause")){
        $(play).addClass("fa-play").removeClass("fa-pause");
        play_pause=false;
        
        get_soundcloud(currTrack);
        
    } else { //if you want to stop another traack from playing and play this track
        get_soundcloud(currTrack);
        
        $(".fa-pause").addClass("fa-play").removeClass("fa-pause");
        $(play).toggleClass("fa-play fa-pause");
        
        
    }
    //if (stop) return;
    
    nowPlaying (currTrack,play_pause,time,play);
}

//show what is playing/paused
function nowPlaying (currTrack,play_pause,time,play) {
    
    //if playing: play_pause=true
    //if not: play_pause=false
    if (play_pause){
        play_pause = 'playing';
        playAudio(true);
    } else {
        play_pause = 'paused';
        playAudio(false);
    }
    
    countDown(time);
    function countDown(time){
        time=time-1000;
        
        //convert duration to digital clock
            var countdownCmins = Math.floor((time % 3600000) / 60000),
                countdownCsecs = Math.ceil(((time % 360000) % 60000) / 1000);
            
            //changes clock from showing xx:60
            if (countdownCsecs===60) {
                countdownCmins += 1;
                countdownCsecs = 00;
            }
            //add '0' in front of number if secs is < 10
            if (countdownCsecs<10) {
                countdownCsecs = '0'+countdownCsecs;
            }
            
            //human readable time
            var countdownClock = countdownCmins + ":" + countdownCsecs;
        
        $("footer p").html('&copy;Harp | crafted by <a href="http://persad.me/" title="Nick Persad">nick persad</a> | <span class="now_playing box_round">'+currTrack+' is '+ play_pause+' '+countdownClock+'</span>');
        
        if (time>0){
            setTimeout(function () {
        
                countDown(time);

            }, 1000);
        }
    }
    
    
    //pause after time elapses (ms)
    function pauseTrack(){
        $("footer p").html('&copy;Harp | crafted by <a href="http://persad.me/" title="Nick Persad">nick persad</a> | <span class="now_playing box_round">'+currTrack+' is paused</span>');
        
        //toggle icon
        toggleControls(play,time,true);
        playAudio(false);
    }
    setTimeout(pauseTrack, time);
    
}

function get_soundcloud(currTrack){
    //track name to send to soundcloud
    var soundcloud = currTrack.replace(/\./g, '').replace(/\s+/g, '-').replace(/\(|\)/g, '').replace(/ /g, "").toLowerCase(),
        soundcloud_api = "http://api.soundcloud.com/tracks/"+soundcloud+sc_client_ID;
    
    $.ajax({
        url: soundcloud_api,
        dataType: 'JSONP'
    })
    .done(function(song) {

        // Check to see if request is valid & contains the info we want
        // If it does, render it. Otherwise throw an error
        if(song !== null && song !== undefined){
            console.log(song);
            get_stream(song);
        } else {
            console.log('no soundcloud file');
        }
    });
    
}

//youtube
//https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCv7IjJclSgpfGUHnG171ovw&order=date&key=AIzaSyBpu8hgnXbkqFVWrAvwRUEz7T13ii3I7WM

//wiki
//https://en.wikipedia.org/w/api.php?action=query&titles=anberlin&prop=revisions&rvprop=content&format=json
function wiki(name){
    
    name = name.replace(/\./g, '').replace(/\s+/g, '_').replace(/\(|\)/g, '').replace(/ /g, "_").toLowerCase();
    
    $.ajax({
	    type: "GET",
	    url: "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page="+name+"&callback=?",
	    contentType: "application/json; charset=utf-8",
	    async: false,
	    dataType: "json",
	    success: function (data, textStatus, jqXHR) {
	    
		var markup = data.parse.text["*"];
		var i = $('<div></div>').html(markup);
		
		// remove links as they will not work
		i.find('a').each(function() { $(this).replaceWith($(this).html()); });
		
		// remove any references
		i.find('sup').remove();
		
		// remove cite error
		i.find('.mw-ext-cite-error').remove();
        
        var text = $(i).find('p');

        if(text.length <= 1 || text === undefined) return;
           
		$('#article').html(text);
			
		
	    },
	    error: function (errorMessage) {
	    }
	});

}

function get_stream(json){
    
    //parse soundcloud json to get mp3
    var stream_url = json.stream_url;
    stream_url = stream_url+sc_client_ID;
    
    if(stream_url!==null && stream_url!==undefined){
        console.log(stream_url);
        $(music).html("<source src='"+stream_url+"' type='audio/wav' />");
    }
    
    
}

//audio control
function playAudio(onoff) {
	if (onoff) {
		music.play();
	} else { 
		music.pause();
	}
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
            var trackDurationClock = mins + ":" + secs,
                currTrack = trackLevel.trackName;
            
            if(currTrack!==undefined){
                var currTrackId = currTrack.replace(/\'/g, 'apppppppp');
            }
                
            
                track += "<li><span class='title'><img src='"+trackLevel.artworkUrl30+"'> <a href='javascript:void(0)' onclick=''>"
                         +currTrack+"</a></span><span class='artist'>"+trackLevel.artistName+"</span><span class='time'>"+trackDurationClock+"</span><span class='controls'><i id='"+currTrackId+"' class='fa fa-play' onclick='toggleControls(this,"+trackDuration+")'></i><i class='fa fa-star-o' onclick='toggleStar(this)'></i></span></li>";
            
            
            harp.$content.html(this).append(track).removeClass('content--error');
        }
        
        $(".wrapper").show();
        harp.toggleLoading();
    }
};


$(document).ready(function(){
    
    $(".wrapper").hide();
    
    $("#version").html("0.1");
    
    harp.$form.keyup(function(e){
        
        e.preventDefault();
        harp.toggleLoading();
        harp.userInput = $(this).find('input').val();
        harp.validate();
        
        
        //call wiki method
        wiki(harp.userInput);
                
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

//Login Form
function check(form) { /*function to check userid & password*/
    /*the following code checkes whether the entered userid and password are matching*/
    if(form.userid.value == "admin" && form.pswrd.value == "persad") {
        window.open('beta/index.html')/*opens the target page while Id & password matches*/
    }
    else {
        alert("Error Password or Username")/*displays error message*/
    }
}