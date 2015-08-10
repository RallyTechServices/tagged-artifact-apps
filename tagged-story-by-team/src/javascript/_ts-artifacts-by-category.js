/**
 * Displays the number of stories in the provided data set in each iteration.
 */
Ext.define('Rally.technicalservices.chart.ArtifactsByCategory',{
    extend: 'Rally.ui.chart.Chart',
    alias: 'widget.tsartifactsbycategory',
    logger: new Rally.technicalservices.Logger(),

    config: {
        records: undefined,

        chartConfig: {
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {
                tickInterval: 1,
                title: {
                    enabled: false
                },
                tickPosition: "inside",
                tickLength: 1,
                labels: {
                    style: {
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                       // textTransform: 'uppercase',
                        fontFamily: 'ProximaNovaLight, Helvetica, Arial',
                        fontStyle: 'normal',
                        fontVariant: 'normal'
                       // textShadow: '1px 1px #888'
                    },
                    align: 'left',
                    x: 15,
                    y: 4
                }
            },
            yAxis: {
                title: {
                    text: '# Stories'
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:,.0f}</b> stories<br/>',
                shared: true
            },
            plotOptions: {
                bar: {
                    stacking: 'num_stories',
                    dataLabels: {
                        enabled: false,
                        formatter: function(){

                        }
                    },
                    pointWidth: 20,
                    pointPadding: 0
                }
            }
        }
    },

    constructor: function(config) {
        this.mergeConfig(config);
        this.config.chartData = this._getChartData(config.records, config.categoryField,config.categoryAttribute || null, config.seriesField, config.seriesFieldValues);
        this.callParent([this.config]);
        var height = this.config.chartData.categories.length * 25;
        this.setHeight(height);

    },
    initComponent: function() {
        this.callParent(arguments);
    },
    _getChartData: function(records, categoryField,categoryAttribute, seriesField, seriesFieldValues){
        var categories = Rally.technicalservices.Toolbox.getCategories(records, categoryField, categoryAttribute),
            series = [],
            hash = Rally.technicalservices.Toolbox.aggregateRecordsByCategory(categories, records, categoryField, categoryAttribute);

        var sorted_hash = _.sortBy(hash, function(records){return -records.length}),
            sorted_categories = [];
        _.each(sorted_hash, function(h){
            sorted_categories.push(Rally.technicalservices.Toolbox._getFieldValue(h[0],categoryField,categoryAttribute));
        });

        _.each(seriesFieldValues, function(val){
              series.push({
                name: val,
                data: Rally.technicalservices.Toolbox.getSeriesForFieldValueCount(hash, sorted_categories, seriesField, val)
            });
        }, this);

        this.logger.log('_getChartData', categories, series);

        return {
            categories: categories,
            series: series
        };

    }
});

