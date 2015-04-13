PracticeService = function($http, $q){
    var self = this;
    self.set_lenght = 10;
    self.fc_queue_size_max = 1;   // 0 - for load FC when needed. 1 - for 1 waiting FC, QUESTIONS_IN_SET - for load all FC on start
    self.fc_queue_size_min = 1;
    self.current = 0;       // number of last provided FC
    self.save_answer_immediately = false;

    self.filter = {
        contexts: [],
        categories: [],
        types: [],
        language: "en"
    };

    var queue = [];
    var deferred_fc = null;
    var promise_resolved_tmp = false;
    var current_fc = null;
    var answer_queue = [];

    // add answer to queue and upload queued answers if necessary
    self.save_answer = function(answer, farce_save){
        if (answer)
            answer_queue.push(answer);

        if (self.save_answer_immediately || farce_save || self.current >= self.set_lenght) {
            if (answer_queue.length > 0) {
                $http.post("/flashcards/answer/", {answers: answer_queue})
                    .error(function (response) {
                        console.error("Problem while uploading answer", response)
                    });
                answer_queue = [];
            }
        }
    };

    self.flush_answer_queue = function(){
        self.save_answer(null, true)
    };

    // build answer from current FC and save
    self.save_answer_to_current_fc = function(answered_fc_id, response_time, meta){
        if (!current_fc) {
            console.error("There is no current flashcard");
            return;
        }
        var answer = {
            flashcard_id: current_fc.id,
            flashcard_answered_id: answered_fc_id,
            response_time: response_time,
            direction: current_fc.direction
        };
        if (meta)
            answer.meta = meta;
        if (current_fc.options){
            answer.option_ids = [];
            current_fc.options.forEach(function(o){
                if (o.id != current_fc.id)
                    answer.option_ids.push(o.id);
            });
        }
        self.save_answer(answer);
    };

    // return promise of flashcard
    self.get_flashcard = function(){
        if(deferred_fc){
            return $q(function(resolve, reject){
                reject("Already one flashcard promised")
            });
        }
        deferred_fc  = $q.defer();
        promise_resolved_tmp = false;
        _resolve_promise();
        deferred_fc.promise.then(function(){ deferred_fc = null;}, function(){ deferred_fc = null;});
        return deferred_fc.promise;
    };

    self.clear_queue = function(){
        queue = [];
    };

    // preload flashcards
    self.preload_flashcards = function(){
        _load_flashcards();
    };

    self.reset_set = function(){
        self.clear_queue();
        self.current = 0;
        deferred_fc = null;
    };

    self.get_fc_queue = function(){
        return queue;
    };

    self.get_answer_queue = function(){
        return answer_queue;
    };


    var _load_flashcards = function(){
        if (queue.length >= self.fc_queue_size_min)                                           // if there are some FC queued
            return;
        self.filter.limit  = self.fc_queue_size_max - queue.length;
        if (deferred_fc && !promise_resolved_tmp) self.filter.limit ++;                  // if we promised one flashcard
        self.filter.limit = Math.min(self.filter.limit, self.set_lenght - self.current - queue.length);  // check size of set
        if (self.filter.limit == 0) return;                         // nothing to do
        self.filter.avoid = current_fc ? [current_fc.id] : [];      // avoid current FC
        queue.forEach(function(fc){
            self.filter.avoid.push(fc.id);
        });

        var filter = {};
        for (var key in self.filter){
            if (self.filter[key] instanceof Array) {
                filter[key] = JSON.stringify(self.filter[key]);
            }else{
                filter[key] = self.filter[key];
            }
        }

        var request;
        if (answer_queue.length == 0) {
            request = $http.get("/flashcards/practice/", {params: filter});
        }else{
            request = $http.post("/flashcards/practice/", {answers: answer_queue}, {params: filter});
            answer_queue = [];
        }
        request
            .success(function(response){
                queue = queue.concat(response.data.flashcards);
                if (queue.length > 0)
                    _resolve_promise();
                else{
                    console.error("No Flashcards to practice")
                }
            })
            .error(function (response) {
                console.error("Something went wrong while loading flashcards from backend.")
            });

    };

    var _resolve_promise = function(){
        if (deferred_fc == null){
            return;
        }
        if (self.set_lenght == self.current){
            deferred_fc.reject("Set was completed");
            return;
        }
        if (queue.length > 0) {
            current_fc = queue.shift();
            self.current++;
            promise_resolved_tmp = true;
            deferred_fc.resolve(current_fc);
        }
        _load_flashcards();
    };
};