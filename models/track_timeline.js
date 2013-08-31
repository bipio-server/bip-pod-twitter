/**
 * 
 * Stores metadata for a syndication feed channel
 * 
 */
TimelineTracking = {};
TimelineTracking.entityName = 'track_timeline';
TimelineTracking.entitySchema = {
    id: {
        type: String,
        renderable: false,
        writable: false
    },
    owner_id : {
        type: String,
        renderable: false,
        writable: false
    },
    
    created : {
        type: String,
        renderable: false,
        writable: false
    },
    
    // last append time
    last_update : {
        type : String,
        renderable : false,
        writable : false
    },
    
    channel_id : {
        type : String,
        renderable : false,
        writable : false
    },
    
    // last tracked id (since_id)   
    last_id_str : {
        type : String,
        renderable : false,
        writable : false
    }
};

TimelineTracking.compoundKeyContraints = {
    channel_id : 1,
    owner_id : 1
};

module.exports = TimelineTracking;