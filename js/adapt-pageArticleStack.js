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
			this.listenTo(Adapt, "remove", this.onRemove);
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
			this.listenTo(Adapt, "pageArticleStack:back", this.onPreviousArticle);
			this.listenTo(Adapt, "pageArticleStack:next", this.onNextArticle);
		},

		enableView: function() {
			this.$el.addClass("page-article-stack");

			this.setupFirstArticle();
			this.listenTo(Adapt, "articleView:preRender", this.onArticlePreRender);
		},

		setupFirstArticle: function() {
			var config = this.model.get("_pageArticleStack");
			if (!config._currentArticleId) {
				config._currentArticleId = this.model.getChildren().models[0].get("_id");
			}
		},

		onPreviousArticle: function() {

		},

		onNextArticle: function() {

		},

		onArticlePreRender: function(view) {
			new ArticleView({el:view.$el[0], model:view.model, pageModel: this.model});
		},

		onRemove: function() {
			this.remove();
		}

	});

	Adapt.on("pageView:preRender", function(view) {
		if (!view.model.get("_pageArticleStack") || !view.model.get("_pageArticleStack")._isEnabled) return false;
		new PageArticleStack({ el: view.$el[0], model:view.model });
	})

    return PageArticleStack;

});
