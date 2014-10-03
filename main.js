//
// album has to be more than one song long
//

//
// Next we need to get all the albums so we can get a track count
// 

var tracks;

var albumSuccess = function (response) {
	console.log('Album Success');
	console.log(response);
	
	var albumNameToIndex = {},
		minSongs = 50;
	for (var i = 0; i < response['albums'].length; i++) {
		var numOfTracks = response['albums'][i]['tracks']['items'].length;
		console.log('number of tracks: ' + numOfTracks);
		if (numOfTracks < minSongs && numOfTracks > 5) {
			minSongs = numOfTracks;
		}

		// now add album name to index mapping
		if (numOfTracks > 5) {
			albumNameToIndex[response['albums'][i]['name']] = {
				index: i,
				numOfTracks: numOfTracks,
				tracksSeen: 0
			};
		} else {
			albumNameToIndex[response['albums'][i]['name']] = {
				index: i,
				numOfTracks: numOfTracks,
				tracksSeen: -1000
			};	
		}
	}

	console.log('Min: ' + minSongs);

	console.log('Album name to index');
	console.log(albumNameToIndex);

	// 'See' the tracks
	for (var i = 0; i < tracks.length; i++) {
		var trackAlbumName = tracks[i]['album']['name'];
		console.log('tracks name: ' + trackAlbumName);

		if (trackAlbumName in albumNameToIndex) {
			albumNameToIndex[trackAlbumName]['tracksSeen'] += 1;
			
			// If this is the last track in the album at any time we want to break
			// that way albums with less songs do not suffer a disadvantage
			if (albumNameToIndex[trackAlbumName]['numOfTracks']
				== albumNameToIndex[trackAlbumName]['tracksSeen']) {
				break;
			}
		}
	}

	// easy way, could fixed later
	// now find the album with the most seen tracks
	var max = 0,
		maxTitle;
	for (var key in albumNameToIndex) {
		console.log('key: ' + key);
		if (max < albumNameToIndex[key]['tracksSeen']) {
			max = albumNameToIndex[key]['tracksSeen'];
			maxTitle = key;
		}
	}

	console.log('TOP ALBUM');
	console.log(maxTitle);
	console.log('number of tracks: ' + albumNameToIndex[maxTitle]['numOfTracks']);

	// $.each(response['albums']['items'], function (index, track) {
	// 	console.log(track['popularity'] + ' ' + track['name'])
	// });
};

var sortByPopularity = function(sortable) {
	sortable.sort(function(a,b) {
		return (parseInt(b['popularity']) - parseInt(a['popularity']));
	});

	return sortable;
}

var trackSuccess = function (response) {
	console.log('Query Success');

	// Sort tracks
	// tracks = JSON.parse(response['tracks']['items']);
	tracks = response['tracks']['items'];
	sortByPopularity(tracks);

	$.each(tracks, function (index, track) {
		console.log(track['popularity'] + ' ' + track['name'] + ', ' + track['album']['name']);
	});

	// Extract album ids
	var albumIDs = [];
	for(var i = 0; i < tracks.length; i++) {
		if (i > 20) {
			break;
		}

		albumIDs.push(tracks[i]['album']['id']);
	}

	albumIDs = $.unique(albumIDs);
	console.log(albumIDs.join(','));

	///
	/// Remember to make them unique
	///
	/// Also there are probably too many album ids. Limit was 20.

    // Make AJAX request for all albums 
    $.ajax({
    	url: 'https://api.spotify.com/v1/albums?ids='
	    	+ albumIDs.join(),
    	success: albumSuccess
    });
};

$(document).ready(function () {

	$('#search-form').submit(function (e) {
	    e.preventDefault();

	    // Get the artist name
	    artistQuery = $('#query').val();

	    // Make AJAX request
	    console.log('Search started.');
	    $.ajax({
	    	url: 'https://api.spotify.com/v1/search?q='
		    	+ artistQuery
		    	+ '&type=artist,track,album&limit=50',
	    	success: trackSuccess
	    });
	});

});