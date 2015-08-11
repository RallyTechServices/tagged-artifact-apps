/**
 * Displays the number of stories in the provided data set in each iteration.
 */
Ext.define('Rally.technicalservices.chart.CumulativeGrowth',{
    extend: 'Rally.ui.chart.Chart',
    alias: 'widget.tscumulativegrowth',
    logger: new Rally.technicalservices.Logger(),

    config: {
        records: undefined,
        startDate: undefined,
        endDate: new Date(),
        chartConfig: {
            chart: {
                type: 'area'
            },
            title: {
                text: ''
            },
            xAxis: {
                tickInterval: 5,
                title: {
                    enabled: false
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
                area: {
                    stacking: 'num_stories',
                    lineColor: '#000000',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    }
                }
            }
        }
    },

    constructor: function(config) {
        this.mergeConfig(config);
        this.config.chartData = this._getChartData(config.records, config.dateFieldMapping);
        this.callParent([this.config]);

    },
    initComponent: function() {
        this.callParent(arguments);
    },
    _getChartData: function(records, dateFieldMapping){
        var category_date_format = 'Y-m-d',
            categories = Rally.technicalservices.Toolbox.getTimeCategories(this.startDate, this.endDate, 'day',category_date_format),
            series = [];

        _.each(dateFieldMapping, function(field, name){
            var hash = Rally.technicalservices.Toolbox.populateTimeHash(this.startDate, this.endDate, 'day', category_date_format, records, field);
            series.push({
                name: name,
                data: Rally.technicalservices.Toolbox.getCumulativeSumFromTimeHash(hash, categories)
            });
        }, this);

        this.logger.log('_getChartData', categories, series);

        return {
            categories: categories,
            series: series
        };

    }
});
