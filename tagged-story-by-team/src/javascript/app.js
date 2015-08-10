Ext.define("tagged-story-by-team", {
    extend: 'Rally.app.TimeboxScopedApp',
    scopeType: 'release',
    supportsUnscheduled: false,

    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),

    config: {
        defaultSettings: {
            tagsOfInterest: []
        }
    },

    onScopeChange: function(timeboxScope){
       this._validateSettings();
    },
    _validateSettings: function(){
        var tags = this._getTags();

        if (this.down('#display_box')){
            this.down('#display_box').destroy();
        }

        this.logger.log('_validateSettings > tags', tags);
        if (this._getTags().length > 0){
            this._fetchStories(this._getTags());
        } else {
            this.add({
                xtype: 'container',
                itemId: 'display_box',
                html: 'No tags have been configured.  Please use the App Settings to configure at least one tag of interest.'
            });
        }
    },
    _getTags: function(){
        var tags = this.getSetting('tagsOfInterest') || [];
        if (!(tags instanceof Array)){
            tags = tags.split(',');
        }
        return tags;
    },
    _fetchStories: function(tags){
        var me = this,
            start_date = this.getContext().getTimeboxScope().getRecord().get('ReleaseStartDate'),
            tag_filters = [];

        _.each(tags, function(tag){
            tag_filters.push({
                property: 'Tags',
                operator: '=',
                value: tag
            });
        });
        var filters = Rally.data.wsapi.Filter.or(tag_filters);
        filters = filters.and({
            property: 'CreationDate',
            operator: '>=',
            value: start_date
        });

        this.logger.log('_fetchStories > filters', filters.toString(), '> start_date', start_date);
        this.setLoading('Loading tagged stories...');
        Rally.technicalservices.WsapiToolbox.fetchWsapiRecords({
            model: 'HierarchicalRequirement',
            fetch: ['FormattedID','ObjectID','Project','ScheduleState'],
            filters: filters
        }).then({
            scope: this,
            success: function(records){
                this.logger.log('_fetchStories > records loaded', records.length);
                this._buildChart(records);
            },
            failure: function(msg){
                Rally.ui.notify.Notifier.showError({message: msg});
            }
        }).always(function(){ me.setLoading(false);});
    },

    _buildChart: function(records){
        var chart = this.add({
            xtype: 'tsartifactsbycategory',
            itemId: 'display_box',
            records: records,
            categoryField: 'Project',
            categoryAttribute: '_refObjectName',
            seriesField: 'ScheduleState',
            seriesFieldValues: ['Defined','In-Progress','Completed','Accepted']
         });

    },

    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    getSettingsFields: function(){
        return [{
            xtype: 'rallytagpicker',
            name: 'tagsOfInterest',
            fieldLabel: 'Tags',
            labelWidth: 150,
            width: 400
        }];
    },
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        Ext.apply(this, settings);
        this._validateSettings();
    }
});