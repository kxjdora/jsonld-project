(function() {
  'use strict';

  

  function jsonldVis(input, selector, config) {
    d3.json("data/person.txt", function(error, input) {
        if (error) throw error;
    var promise = jsonld.compact(input,{});
    promise.then(function(input) {
        if (!arguments.length) return jsonldVis;
        config = config || {};
    
        var h = config.h || 600
          , w = config.w || 800
          , maxLabelWidth = config.maxLabelWidth || 250
          , transitionDuration = config.transitionDuration || 750
          , transitionEase = config.transitionEase || 'cubic-in-out'
          , minRadius = config.minRadius || 5
          , scalingFactor = config.scalingFactor || 2;
    
        var i = 0;
    
        var tree = d3.layout.tree()
          .size([h, w]);
    
        var diagonal = d3.svg.diagonal()
          .projection(function(d) { return [d.y, d.x]; });
    
        var svg = d3.select(selector).append('svg')
          .attr('width', w)
          .attr('height', h)
          .append('g')
          .attr('transform', 'translate(' + maxLabelWidth + ',0)');
    
        var tip = d3.tip()
          .direction(function(d) {
            return d.children || d._children ? 'w' : 'e';
          })
          .offset(function(d) {
            return d.children || d._children ? [0, -3] : [0, 3];
          })
          .attr('class', 'd3-tip')
          .html(function(d) {
            return '<span>' + d.valueExtended + '</span>';
          });
    
        svg.call(tip);
    
        var root = jsonldTree(input);
        root.x0 = h / 2;
        root.y0 = 0;
        if(root.children){
          root.children.forEach(collapse);
        }
            
        function changeSVGWidth(newWidth) {
          if (w !== newWidth) {
            d3.select(selector + ' > svg').attr('width', newWidth);
          }
        }
    
        function jsonldTree(source) {
          var tree = {};
    
          if ('@id' in source) {
            tree.isIdNode = true;
            tree.name = source['@id'];
            if (tree.name.length > maxLabelWidth / 9) {
              tree.valueExtended = tree.name;
              tree.name = '...' + tree.valueExtended.slice(-Math.floor(maxLabelWidth / 9));
            }
          } else {
            tree.isIdNode = true;
            tree.isBlankNode = true;
            // random id, can replace with actual uuid generator if needed
            tree.name = 'BlankNode';
          }
    
          var children = [];
          Object.keys(source).forEach(function(key) {
            if (key === '@id' || key === '@context' || source[key] === null) return;
    
            var valueExtended, value;
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
              var temp_array = [];
              var temp_tree=jsonldTree(source[key]);
              if(temp_tree.name==='BlankNode'){
                temp_array = temp_tree.children;
              }else{
                temp_array=[jsonldTree(source[key])];
              }
              children.push({
                name: key,
                children:temp_array
              });
            } else if (Array.isArray(source[key])) {
              var temp_array = [];
              var node_index=0;
              source[key].forEach(function(item) {
                if (typeof item === 'object') {
                  var temp_tree=jsonldTree(item);
                  if(temp_tree.name==='BlankNode'&&source[key].length==1){
                     temp_array = temp_tree.children;
                  }else{
                    if(temp_tree.name==='BlankNode'){
                      node_index++;
                      temp_tree.name="BlankNode"+node_index;
                    }
                    temp_array.push(temp_tree);
                  }
                } else {
                  return temp_array.push({ name: item });
                }
              })
              children.push({
                name: key,
                children: temp_array
              });
            } else {
              valueExtended = source[key];
              value = valueExtended;
              if (value.length > maxLabelWidth / 9) {
                value = value.slice(0, Math.floor(maxLabelWidth / 9)) + '...';
                children.push({
                  name: key,
                  value: value,
                  valueExtended: valueExtended
                });
              } else {
                children.push({
                  name: key,
                  value: value
                });
              }
            }
          });
    
          if (children.length) {
            tree.children = children;
          }

          if(tree.name==='BlankNode'&&tree.children.length===1){
             tree=tree.children[0];
          }
         
          return tree;
        }
    
        function update(source) {
          var nodes = tree.nodes(root).reverse();
          var links = tree.links(nodes);
    
          nodes.forEach(function(d) { d.y = d.depth * maxLabelWidth; });
    
          var node = svg.selectAll('g.node')
            .data(nodes, function(d) { return d.id || (d.id = ++i); });
    
          var nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', function(d) { return 'translate(' + source.y0 + ',' + source.x0 + ')'; })
            .on('click', click);
    
          nodeEnter.append('circle')
            .attr('r', 0)
            .style('stroke-width', function(d) {
              return d.isIdNode ? '2px' : '1px';
            })
            .style('stroke', function(d) {
              return d.isIdNode ? '#F7CA18' : '#4ECDC4';
            })
            .style('fill', function(d) {
              if (d.isIdNode) {
                return d._children ? '#F5D76E' : 'white';
              } else {
                return d._children ? '#86E2D5' : 'white';
              }
            })
            .on('mouseover', function(d) { if (d.valueExtended) tip.show(d); })
            .on('mouseout', tip.hide);

    /*
       nodeEnter.append('a')
       .attr('xlink:href',d=>{
           if(d.name.indexOf("http")!=-1){
              return d.name;
           }
       })
       .style('text-decoration', d=>{
        if(d.name.indexOf("http")!=-1){ 
            return 'underline';
        }
       })
       .append('text')
       .attr('x', function(d) {
         var spacing = computeRadius(d) + 5;
         return d.children || d._children ? -spacing : spacing;
       })
       .attr('dy', '4')
       .attr('text-anchor', function(d) { return d.children || d._children ? 'end' : 'start'; })
       .text(function(d) { 
           var key_index;
           var key = d.name;
           if(d.name.indexOf("http")!=-1){                  
                key_index = d.name.lastIndexOf("/")+1;
                key = d.name.slice(key_index);         
           }        
           return key + (d.value ? ': ' + d.value : ''); 
        })
       .style('fill', d=>{
        if(d.name.indexOf("http")!=-1){ 
            return 'blue';
        }
       })
*/

//node name
nodeEnter.append('a')
.attr('xlink:href',d=>{
    if(d.name&&d.name.indexOf("http")!=-1){
       return d.name;
    }
})
.style('text-decoration', d=>{
 if(d.name&&d.name.indexOf("http")!=-1){ 
     return 'underline';
 }
})
.append('text')
.attr('x', function(d) {
  var spacing = computeRadius(d) + 5;
  return d.children || d._children ? -spacing : spacing;
})
.attr('dy', '15')
.attr('text-anchor', 'end')
.text(function(d) { 
    var key_index;
    var key = d.name;
    if(d.name&&d.name.indexOf("http")!=-1){                  
         key_index = d.name.lastIndexOf("/")+1;
         key = d.name.slice(key_index);         
    }        
    return key + (d.value ? ':' : ''); 
 })
.style('fill', d=>{
 if(d.name && d.name.indexOf("http")!=-1){ 
     return 'blue';
 }
})

//node value
nodeEnter.append('a')
.attr('xlink:href',d=>{
    if(typeof d.value == "string" && d.value.indexOf("http")!=-1){
       return d.valueExtended;
    }
})
.style('text-decoration', d=>{
 if(typeof d.value == "string" &&d.value.indexOf("http")!=-1){ 
     return 'underline';
 }
})
.append('text')
.attr('x', function(d) {
    var spacing = computeRadius(d)+5;
    return d.children || d._children ? -spacing : spacing;
})
.attr('dy', '15')
.attr('text-anchor', 'start')
.text(function(d) { 
    return d.value;
 })
.style('fill', d=>{
 if(typeof d.value == "string" && d.value.indexOf("http")!=-1){ 
     return 'blue';
 }
})
        
       //鼠标悬浮在节点上提示超链接url
       nodeEnter.append("svg:title")  
            .text(function(d) {
                if(d.name&&d.name.indexOf("http")!=-1){ 
                    return d.name;
                }
            });

          var maxSpan = Math.max.apply(Math, nodes.map(function(d) { return d.y + maxLabelWidth; }));
          if (maxSpan + maxLabelWidth + 20 > w) {
            changeSVGWidth(maxSpan + maxLabelWidth);
            d3.select(selector).node().scrollLeft = source.y0;
          }
    
          var nodeUpdate = node.transition()
            .duration(transitionDuration)
            .ease(transitionEase)
            .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });
    
          nodeUpdate.select('circle')
            .attr('r', function(d) { return computeRadius(d); })
            .style('stroke-width', function(d) {
              return d.isIdNode ? '2px' : '1px';
            })
            .style('stroke', function(d) {
              return d.isIdNode ? '#F7CA18' : '#4ECDC4';
            })
            .style('fill', function(d) {
              if (d.isIdNode) {
                return d._children ? '#F5D76E' : 'white';
              } else {
                return d._children ? '#86E2D5' : 'white';
              }
            });
    
          nodeUpdate.select('text').style('fill-opacity', 1);
    
          var nodeExit = node.exit().transition()
            .duration(transitionDuration)
            .ease(transitionEase)
            .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')'; })
            .remove();
    
          nodeExit.select('circle').attr('r', 0);
          nodeExit.select('text').style('fill-opacity', 0);
    
          var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.target.id; });
    
          link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', function(d) {
              var o = { x: source.x0, y: source.y0 };
              return diagonal({ source: o, target: o });
            });
    
          link.transition()
            .duration(transitionDuration)
            .ease(transitionEase)
            .attr('d', diagonal);
    
          link.exit().transition()
            .duration(transitionDuration)
            .ease(transitionEase)
            .attr('d', function(d) {
              var o = { x: source.x, y: source.y };
              return diagonal({ source: o, target: o });
            })
            .remove();
    
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }
    
        function computeRadius(d) {
          if (d.children || d._children) {
            return minRadius + (numEndNodes(d) / scalingFactor);
          } else {
            return minRadius;
          }
        }
    
        function numEndNodes(n) {
          var num = 0;
          if (n.children) {
            n.children.forEach(function(c) {
              num += numEndNodes(c);
            });
          } else if (n._children) {
            n._children.forEach(function(c) {
              num += numEndNodes(c);
            });
          } else {
            num++;
          }
          return num;
        }
    
        function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
    
          update(d);
    
          // fast-forward blank nodes
          if (d.children) {
            d.children.forEach(function(child) {
              if (child.isBlankNode && child._children) {
                click(child);
              }
            });
          }
        }
    
        function collapse(d) {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
          }
        }
    
        update(root);
      });
    })
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsonldVis;
  } else {
    d3.jsonldVis = jsonldVis;
  }

})();
