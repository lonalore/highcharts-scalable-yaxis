/**
 * Highcharts plugin for manually scaling Y-Axis range.
 *
 * Author: Roland Banguiran
 * Email: banguiran@gmail.com
 *
 * Usage: Set scalable:false in the yAxis options to disable.
 * Default: true
 */
(function (H) {
	var addEvent = H.addEvent,
		each = H.each,
		doc = document,
		body = doc.body;
    
    H.wrap(H.Chart.prototype, 'init', function (proceed) {
        
		// Run the original proceed method
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));
		
        var chart = this,
			renderer = chart.renderer,
            yAxis = chart.yAxis;
		
		each(yAxis, function (yAxis) {
			var labelGroup = yAxis.labelGroup,
				options = yAxis.options,
				scalable = typeof options.scalable === 'undefined' ? true : false ,
				labels = options.labels,
				pointer = chart.pointer,
				labelGroupBBox,
				bBoxX,
				bBoxY,
				bBoxWidth,
				bBoxHeight,
				startDrag,
				isDragging = false,
				downYValue;
			
			if (scalable) {
				bBoxWidth = 40;
				bBoxHeight = chart.containerHeight - yAxis.top - yAxis.bottom;
				bBoxX = yAxis.opposite ? (labels.align == 'left' ? chart.containerWidth - yAxis.right : chart.containerWidth - (yAxis.right + bBoxWidth)) : (labels.align == 'left' ? yAxis.left : yAxis.left - bBoxWidth);
				bBoxY = yAxis.top;
				
				// Render an invisible bounding box around the y-axis label group
				// This is where we add mousedown event to start dragging
				labelGroupBBox = renderer.rect(bBoxX, bBoxY, bBoxWidth, bBoxHeight)
					.attr({
						fill: '#fff',
						opacity: 0,
						zIndex: 8
					})
					.css({
						cursor: 'ns-resize',
					})
					.add();

				labels.style.cursor = 'ns-resize';
				
				startDragging = function (e) {			
					var downYPixels = pointer.normalize(e).chartY;
					
					downYValue = yAxis.toValue(downYPixels);
					isDragging = true;
				}
				
				addEvent(labelGroup.element, 'mousedown', startDragging);
				addEvent(labelGroupBBox.element, 'mousedown', startDragging);
				
				addEvent(chart.container, 'mousemove', function (e) {
					if (isDragging) {
						body.style.cursor = 'ns-resize';
						
						var dragYPixels = chart.pointer.normalize(e).chartY,
							dragYValue = yAxis.toValue(dragYPixels),
							
							extremes = yAxis.getExtremes(),
							userMin = extremes.userMin,
							userMax = extremes.userMax,
							dataMin = extremes.dataMin,
							dataMax = extremes.dataMax,
							
							min = (typeof userMin !== 'undefined') ? userMin : dataMin,
							max = (typeof userMax !== 'undefined') ? userMax : dataMax,
							
							newMin,
							newMax;
						
						// update max extreme only if dragged from upper portion
						// update min extreme only if dragged from lower portion
						if (downYValue > (dataMin + dataMax) / 2) {
							newMin = min;
							newMax = max - (dragYValue - downYValue);
						} else {
							newMin = min - (dragYValue - downYValue);
							newMax = max;
						}
						
						yAxis.setExtremes(newMin, newMax, true, false);
					}
				});
				
				addEvent(document, 'mouseup', function () {
					body.style.cursor = 'default';
					isDragging = false;
				});
			}
		});
    });
}(Highcharts));
