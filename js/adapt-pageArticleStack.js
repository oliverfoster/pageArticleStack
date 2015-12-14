define([
    'coreJS/adapt'
],function(Adapt) {

	$(document).on("click", "[data-adapt-trigger]", function(event) {
		event.preventDefault();
		var $target = $(event.currentTarget);
		var eventName = $target.data("adapt-trigger");
		Adapt.trigger(eventName);
	});

	var ArticleView = Backbone.View.extend({

		initialize: function(options) {
			this.pageModel = options.pageModel;
			this.pageView = options.pageView;
			this.setupEventListeners();

			if (this.isVisibleArticle()) {
				this.$el.addClass("article-current").removeClass("article-disabled");
			} else {
				this.$el.removeClass("article-current").addClass("article-disabled");
			}
			
		},

		isVisibleArticle: function() {
			var config = this.pageModel.get("_pageArticleStack");
			var id = this.model.get("_id");

			if (config._currentArticleId == id) return true;
			return false;
		},

		setupEventListeners: function() {
			this.listenTo(Adapt, "pageArticleStack:moveTo", this.onMoveTo);
			this.listenTo(Adapt, "articleView:postRender", this.onPostRender);
			this.listenTo(Adapt, "remove", this.onRemove);
		},

		onPostRender: function(view) {
			if (this.model.get("_id") != view.model.get("_id")) return;

			var $controls = $(Handlebars.templates['pageArticleStack-articleheader'](this.model.toJSON()));

			this.$(".article-header").append($controls);
		},

		onMoveTo: function(id, from, direction) {
			var thisId = this.model.get("_id");
			if (from == thisId) {
				this.animateOut(direction);
			}
			if (id == thisId) {
				this.animateIn(direction);
			}

		},

		animateOut: function(direction) {
			console.log("animating out", this.model.get("_id"));

			var config = this.pageView.getCurrentArticleTransitionConfig();
			var directionConfig;
			var directionClass;
			switch(direction) {
			case "previous":
			 	directionClass = "article-previous";
				directionConfig = config._outPrevious;
				break;
			default:
				directionClass = "article-next";
				directionConfig = config._outNext;
			}
			var options = directionConfig._options || { duration: 1500 };
			this.$el.css({
				"display": "block",
				"visibility": "visible",
				"opacity": 1
			});
			options.begin = _.bind(function() {
				this.$el.addClass(directionClass+" article-positioning article-positioning-out").removeClass("article-current");
			}, this);
			options.complete = _.bind(function() {
				this.$el.addClass("article-disabled").removeClass(directionClass+" article-positioning  article-positioning-out");
				this.$el.css({
					"display": "block",
					"visibility": "hidden"
				});
			}, this);

			var command = directionConfig._command;
			switch(command) {
			case "slideDown": 
				this.$el.velocity({
					translateY:"0%",
					translateX:"0px"
				}, {
					duration: 0
				});
				command = {
					translateY: "100%"
				};
				break;
			case "slideUp": 
				this.$el.velocity({
					translateY:"0%",
					translateX:"0px"
				}, {
					duration: 0
				});
				command = {
					translateY: "-100%"
				};
				break;
			case "slideLeft": 
				this.$el.velocity({
					translateY:"0px",
					translateX:"0px"
				}, {
					duration: 0
				});
				command = {
					translateX: -$(window).width() + "px"
				};
				break;
			case "slideRight": 
				this.$el.velocity({
					translateY:"0px",
					translateX:"0px"
				}, {
					duration: 0
				});
				command = {
					translateX: $(window).width() + "px"
				};
				break;
			default:
				command = "fadeOut";
			}

			this.$el.velocity(command, options);
		},

		animateIn: function(direction) {
			console.log("animating in", this.model.get("_id"));
			var config = this.getTransitionConfig();
			var directionConfig;
			var directionClass;
			switch(direction) {
			case "previous":
			 	directionClass = "article-previous";
				directionConfig = config._inPrevious;
				break;
			default:
				directionClass = "article-next";
				directionConfig = config._inNext;
			}
			var options = directionConfig._options || { duration: 1500 };
			this.$el.css({
				"display": "block",
				"visibility": "visible",
				"opacity": 1
			});
			options.begin = _.bind(function() {
				this.$el.addClass(directionClass+" article-positioning article-positioning-in").removeClass("article-disabled");
			}, this);
			options.complete = _.bind(function() {
				this.$el.addClass("article-current").removeClass(directionClass+" article-positioning  article-positioning-in");
			}, this);

			var command = directionConfig._command;
			switch(command) {
			case "slideDown": 
				this.$el.velocity({
					translateX:"0px",
					translateY:"-100%"
				}, {
					duration: 0
				});
				command = {
					translateY:"0%"
				};
				break;
			case "slideUp": 
				this.$el.velocity({
					translateX:"0px",
					translateY: $(window).height() + "px"
				}, {
					duration: 0
				});
				command = {
					translateY:"0px"
				};
				break;
			case "slideLeft": 
				this.$el.velocity({
					translateY:"0px",
					translateX: $(window).width() + "px"
				}, {
					duration: 0
				});
				command = {
					translateX:"0px"
				};
				break;
			case "slideRight": 
				this.$el.velocity({
					translateY:"0px",
					translateX: -$(window).width() + "px"
				}, {
					duration: 0
				});
				command = {
					translateX:"0px"
				};
				break;
			default:
				command = "fadeIn";
			}

			this.$el.velocity(command, options);
		},

		getTransitionConfig: function() {
			var config = this.model.get("_pageArticleStack");
			if (!config || !config._articleTransitions) {
				config = this.pageModel.get("_pageArticleStack");
				if (!config || !config._articleTransitions) {
					return {
						"_outPrevious": {
							"_command": "slideRight",
							"_options": {
								"duration": 500
							}
						},
						"_inPrevious": {
							"_command": "slideRight",
							"_options": {
								"duration": 500
							}
						},
						"_outNext": {
							"_command": "slideLeft",
							"_options": {
								"duration": 1000
							}
						},
						"_inNext": {
							"_command": "slideLeft",
							"_options": {
								"duration": 1000
							}
						}
					};
				}
			}
			return config._articleTransitions;
		},

		onRemove: function() {
			this.pageView = undefined;
			this.pageModel = undefined;
			this.remove();
		}

	});


	var Overlay = Backbone.View.extend({

		className: "pagearticlestack-overlay",

		initialize: function() {
			this.setupEventListeners();
			this.render();
		},

		setupEventListeners: function() {
			this.listenTo(Adapt, "pageArticleStack:moveTo pageArticleStack:overlay", this.onMoveTo);
			this.listenTo(Adapt, "remove", this.onRemove);
		},

		render: function() {
			this.$el.append($(Handlebars.templates['pageArticleStack-overlay'](this.model.toJSON())));
		},

		onMoveTo: function(to, from, direction) {

			var step2 = _.bind(function() {
				this.$(".partitions-2")
				.css({
					height: "500%"
				});
				this.$(".partitions-1")
				.css({
					display: "none"
				});
				this.$(".partitions-2")
				.velocity({ 
					height: "0%"
				}, {
					easing: "easeOutSine",
					duration: 400
				});
			}, this);

			this.$(".partitions-1")
			.css({
				height: "0%",
				display: "block"
			})
			.velocity({ 
				height: "500%"
			}, {
				delay: 400,
				duration: 400,
				easing: "easeInSine",
				complete: step2
			});

		},

		onRemove: function() {
			this.remove();
		}

	});


	var PageArticleStack = Backbone.View.extend({

		initialize: function() {
			this.enableView();
			this.setupEventListeners();
		},

		setupEventListeners: function() {
			this.listenTo(Adapt, "remove", this.onRemove);
			this.listenTo(Adapt, "pageArticleStack:previous", this.onPreviousArticle);
			this.listenTo(Adapt, "pageArticleStack:next", this.onNextArticle);
		},

		enableView: function() {
			this.$el.addClass("page-article-stack");

			this.setupFirstArticle();
			this.setupOverlay();
			this.listenTo(Adapt, "articleView:preRender", this.onArticlePreRender);
		},

		setupFirstArticle: function() {
			var config = this.model.get("_pageArticleStack");
			if (!config._currentArticleId) {
				var firstArticleId = this.model.getChildren().where({"_isAvailable": true})[0].get("_id")
				this.setCurrentArticleId(firstArticleId);
			}
		},

		setupOverlay: function() {
			var overlay = new Overlay({model: this.model});
			$("body").append(overlay.$el);
		},

		setCurrentArticleId: function(id) {
			var config = this.model.get("_pageArticleStack");
			config._currentArticleId = id
		},

		getCurrentArticleId: function() {
			var config = this.model.get("_pageArticleStack");
			return config._currentArticleId;
		},

		getCurrentArticleTransitionConfig: function() {
			var currentId = this.getCurrentArticleId();
			var config = Adapt.findById(currentId).get("_pageArticleStack");
			if (!config || !config._articleTransitions) {
				config = this.model.get("_pageArticleStack");
				if (!config || !config._articleTransitions) {
					return {
						"_outPrevious": {
							"_command": "slideRight",
							"_options": {
								"duration": 500
							}
						},
						"_inPrevious": {
							"_command": "slideRight",
							"_options": {
								"duration": 500
							}
						},
						"_outNext": {
							"_command": "slideLeft",
							"_options": {
								"duration": 1600
							}
						},
						"_inNext": {
							"_command": "slideLeft",
							"_options": {
								"duration": 1600
							}
						}
					};
				}
			}
			return config._articleTransitions;
		},

		getPreviousArticleId: function() {
			var children = this.model.getChildren().where({"_isAvailable": true});
			var currentId = this.getCurrentArticleId();
			var previousIndex = 0;
			for (var i = 0, l = children.length; i < l; i++) {
				if (children[i].get("_id") == currentId) {
					previousIndex = i - 1;
					break;
				}
			}
			if (previousIndex < 0) previousIndex = children.length - 1;
			return children[previousIndex].get("_id");
		},

		getNextArticleId: function() {
			var children = this.model.getChildren().where({"_isAvailable": true});
			var currentId = this.getCurrentArticleId();
			var nextIndex = 0;
			for (var i = 0, l = children.length; i < l; i++) {
				if (children[i].get("_id") == currentId) {
					nextIndex = i + 1;
					break;
				}
			}
			if (nextIndex > children.length - 1) nextIndex = 0
			return children[nextIndex].get("_id");
		},

		onPreviousArticle: function() {
			var currentId = this.getCurrentArticleId();
			var previousId = this.getPreviousArticleId();
			this.setCurrentArticleId(previousId);
			Adapt.trigger("pageArticleStack:moveTo", previousId, currentId, "previous");
		},

		onNextArticle: function() {
			var currentId = this.getCurrentArticleId();
			var nextId = this.getNextArticleId();
			this.setCurrentArticleId(nextId);
			Adapt.trigger("pageArticleStack:moveTo", nextId, currentId, "next");	
		},

		onArticlePreRender: function(view) {
			new ArticleView({el:view.$el[0], model:view.model, pageModel: this.model, pageView: this});
		},

		onRemove: function() {
			this.remove();
		}

	});

	Adapt.on("pageView:preRender", function(view) {
		if (!view.model.get("_pageArticleStack") || !view.model.get("_pageArticleStack")._isEnabled) return false;
		new PageArticleStack({ el: view.$el[0], model:view.model });
	});

    return PageArticleStack;

});
