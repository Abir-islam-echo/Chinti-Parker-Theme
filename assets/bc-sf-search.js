// Override Settings
var bcSfSearchSettings = {
    search: {
        //suggestionMode: 'test',
        //suggestionPosition: 'left'
    }
};

// Customize style of Suggestion box
BCSfFilter.prototype.customizeSuggestion = function(suggestionElement, searchElement, searchBoxId) {
    var self = this;
   jQ(window).resize(function() {
            self.buildSuggestionWrapper( '#ui-id-1' ,searchBoxId);
            self.buildStyleSuggestion(suggestionElement, searchElement, searchBoxId);
    });
};