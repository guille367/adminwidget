var dFalopa = require('./modelmock.js');
//ajax call
load(dFalopa,6,8,["#ECD078", "#D95B43", "#C02942", "#542437", "#53777A", "#c1dd53"],300);
//data, vertical width, vertical rows , arrColores ,vertical height

function load(data, vWidth,vFilas,pRango,vHeight){


    var custom_bubble_chart, container, referencias;
    container = $("#contenedor");
    referencias = $(".referencias");


    // var jurisdiccion = [];
    // var jurisdiccionID = [];
    // var finalidad = [];
    // var finalidadID = [];
    // var totalesFinalidad = [];
    // var totalesJurisdiccion = [];

    rubro = {
        Nombre: '',
        Id: 0,
        Items:[{}],
        Cantidad: 0,
    }

    var Rubros = [];

    data.map(function(item){

        let rubro = {};
        var q = itemsPorRubro.find((i) => { return i.Nombre == item.Rubro; });

        if(q){
            q.Items.push(item);
            q.Cantidad++;
        }
        else{
            rubro.Nombre = item.Rubro;
            rubro.Items = [];
            rubro.Items.push(item);
            rubro.CantidadItems = 1;
            rubro.Id = item.IdRubro;
            Rubros.push(rubro);
        }
    });

    // data.forEach(function(d) {

    //     if (jurisdiccion.indexOf(d.jurisdiccion) < 0) {
    //         jurisdiccion.push(d.jurisdiccion); // junto todos los ids
    //         totalesJurisdiccion.push(0);
    //     };

    //     if (jurisdiccionID.indexOf(d.id_jurisdiccion) < 0) {
    //         jurisdiccionID.push(d.id_jurisdiccion); // junto todos los ids
    //     };

    //     if (finalidad.indexOf(d.finalidad) < 0) {
    //         finalidad.push(d.finalidad); // junto todos las etiquetas
    //         totalesFinalidad.push(0);
    //     };
    //     if (finalidadID.indexOf(d.id_finalidad) < 0) {
    //         finalidadID.push(d.id_finalidad); // junto todos los ids
    //     };

    //     totalesFinalidad[finalidad.indexOf(d.finalidad)] = parseInt(totalesFinalidad[finalidad.indexOf(d.finalidad)]) + parseInt(d.monto);
    //     totalesJurisdiccion[jurisdiccion.indexOf(d.jurisdiccion)] = parseInt(totalesJurisdiccion[jurisdiccion.indexOf(d.jurisdiccion)]) + parseInt(d.monto);

    // });

    //Ex finalidad2d REVISAR
    var rubros2d = []; // armo array 2d para ordenar
    for (var i = 0; i < finalidad.length; i++) {
        // REVISAR ARRAY
        //
        rubros2d[i] = {Id: Rubros[i].Id, Cantidad: Rubros[i].Cantidad};
    }

    rubros2d.sort(function(a, b) {
        return d3.descending(a[1], b[1]);
    })

    // var jurisdiccion2d = []; // armo array 2d para ordenar
    // for (var i = 0; i < jurisdiccion.length; i++) {
    //     jurisdiccion2d[i] = [jurisdiccion[i], totalesJurisdiccion[i], jurisdiccionID[i]];
    // }

    // jurisdiccion2d.sort(function(a, b) {
    //     return d3.descending(a[1], b[1]);
    // })

    custom_bubble_chart = (function(d3, CustomTooltip) {
        "use strict";

        var width = 1200,
            height = 600,
            tooltip = CustomTooltip("tooltip", 300),
            gravedad = -0.01,
            friction = 0.9,
            damper = 0.45,
            nodes = [],
            radioMinimo = 3,
            radioMaximo = 70,
            vis, force, circles, radius_scale,
            montosLiterales = function(n) {
                return formatNumber(n * 1)
            };


        var center = {
            x: width / 2,
            y: height / 2
        };

        var centroides = {};
        for (var i = 0; i < Rubros.length; i++) {
            var r = Rubros[i];
            centroides[r.Id] = {
                id: r.Id,
                cantidad: r.Cantidad,
                x: (i + 1) * (width) / vWidth,
                y: height / 2
            }
        }

        var fill_color = d3.scale.ordinal()
            .domain(Rubros)
            .range(pRango);

        function custom_chart(data) {
            var max_amount = d3.max(data, function(d) {
                    return parseInt(d.monto, 10);
                }),
                radius_scale = d3.scale.linear().domain([0, max_amount]).range([radioMinimo, radioMaximo]);
            
            REVISAR 
            data.forEach(function(d) {
                var node = {
                    Id: d.Id,
                    radius: radius_scale(parseInt(d.Cantidad, 10)),
                    Cantidad: d.Cantidad,
                    // monto: d.monto,
                    // jurisdiccion: d.jurisdiccion,
                    // id_jurisdiccion: d.id_jurisdiccion,
                    // finalidad: d.finalidad,
                    // id_finalidad: d.id_finalidad,
                    // funcion: d.funcion,
                    // id_funcion: d.id_funcion,
                    x: Math.random() * width,
                    y: Math.random() * height,
                };
                nodes.push(node);

            });

            nodes.sort(function(a, b) {
                return b.Cantidad - a.Cantidad;
            });

            vis = d3.select("#presupuesto-visualizado").append("svg")
                .attr("width", width)

            circles = vis.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", 0)
                .style("opacity", 0.9)
                .attr("fill", function(d) {
                    return fill_color(d.finalidad); // REVISAR COLOR
                })
                .attr("stroke-width", 1.5)
                .attr("stroke", function(d) {
                    return d3.rgb(fill_color(d.finalidad)).darker(); // REVISAR COLOR
                })
                .attr("id", function(d) {
                    return "bubble_" + d.id_finalidad; // REVISAR
                })
                .on("mouseover", function(d, i) {
                    var el = d3.select(this)
                    el.style("stroke-width", 3)
                    el.style("opacity", 0.9);
                    show_details(d, i, this);
                })
                .on("mouseout", function(d, i) {
                    hide_details(d, i, this);
                    var el = d3.select(this)
                    el.style("stroke-width", 1.5)
                    el.style("opacity", function (){
                        if ($('#jurisdiccion').hasClass('disabled')){
                            return 0.3;
                        }
                            return 0.9;
                        });
                });

            circles.transition().duration(1500).attr("r", function(d) {
                return d.radius;
            });

        }

        d3.selection.prototype.moveToFront = function() {
            return this.each(function() {
                this.parentNode.appendChild(this);
            });
        };

        function charge(d) {
            if (d.value < 0) {
                return 0
            } else {
                return -Math.pow(d.radius, 1.9)
            };
        }

        function start() {
            force = d3.layout.force()
                .nodes(nodes)
                .size([width, height]);
        }

        function mostrarGrupoCompleto() {
            // Inicio force
            force.gravity(gravedad)
                .charge(charge)
                .friction(friction)
                .on("tick", function(e) {
                    circles.each(moverAlCentro(e.alpha))
                        .attr("fill", function(d) {
                            return fill_color(d.finalidad); //REVISAR COLOR propiedad
                        })
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        })
                        .style("opacity", 0.9);
                });
            force.start();
            borrarReferencias();
        }

        function moverAlCentro(alpha) {
            // Muevo objetos al centro
            return function(d) {
                d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
            };
        }

        function mostrarFinalidad() {
            force.gravity(gravedad)
                .charge(charge)
                .friction(0.9)
                .on("tick", function(e) {
                    circles.each(ordenFinalidad(e.alpha))
                        .attr("fill", function(d) {
                            return fill_color(d.finalidad);
                        })
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        })
                        .style("opacity", 0.9);
                });
            force.start();
            titulosFinalidad();
        }

        function ordenFinalidad(alpha) {
            return function(d) {
                var target = centroides_finalidad[d.id_finalidad];
                d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.2;
                d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.2;
            };
        }

        function titulosFinalidad() {
            borrarReferencias();
            var finalidadId = centroides_finalidad;
            var finalidadKeys = d3.keys(finalidadId);
            var finalidad = vis.append("g").classed("finalidad", true).attr("transform", "translate(0," + (height - 90) + ")").selectAll(".finalidad").data(finalidadKeys);

            finalidad.enter()
                .append("text")
                .style("opacity", 0)
                .attr("class", "titulo")
                .attr("x", function(i) {
                    return finalidadId[i].x;
                })
                .attr("dy", "3em")
                .attr("y", -20)
                .attr("text-wrap", "normal")
                .attr("text-anchor", "middle")
                .text(function(i) {
                    return finalidadId[i].id;
                })
                .call(wrap, 130)
                .transition().duration(500).style("opacity", 1);

            finalidad.enter()
                .append("text")
                .style("opacity", 0)
                .attr("class", "total")
                .attr("x", function(i) {
                    return finalidadId[i].x;
                })
                .attr("y", 0)
                .attr("text-wrap", "normal")
                .attr("text-anchor", "middle")
                .text(function(i) {
                    return "$" + montosLiterales(finalidadId[i].monto);
                })
                .transition().duration(750).style("opacity", 1);
        }

        function titulosJurisdiccion() {
            borrarReferencias();
            var jurisdiccionId = centroides_jurisdiccion;

            var jurisdiccionKeys = d3.keys(centroides_jurisdiccion);
            var jurisdiccion = vis.append("g").classed("jurisdiccion", true).attr("transform", "translate(0," + 0 + ")").selectAll(".jurisdiccion").data(jurisdiccionKeys); // =^.^=

            jurisdiccion.enter()
                .append("text")
                .style("opacity", 0)
                .attr("class", "titulo")
                .attr("x", function(i) {
                    return jurisdiccionId[i].x;
                })
                .attr("dy", "3em")
                .attr("y", function(i) {
                    return jurisdiccionId[i].y - 20;
                })
                .style("pointer-events", "none")
                .attr("text-wrap", "normal")
                .attr("text-anchor", "middle")
                .text(function(i) {
                    return jurisdiccionId[i].id;
                })
                .call(wrap, 130)
                .transition().duration(500).style("opacity", 1);

            jurisdiccion.enter()
                .append("text")
                .style("opacity", 0)
                .attr("class", "total")
                .attr("x", function(i) {
                    return jurisdiccionId[i].x;
                })
                .attr("y", function(i) {
                    return jurisdiccionId[i].y;
                })
                .style("pointer-events", "none")
                .attr("text-wrap", "normal")
                .attr("text-anchor", "middle")
                .text(function(i) {
                    return "$" + montosLiterales(jurisdiccionId[i].monto);
                })
                .transition().duration(750).style("opacity", 1);
        }

        function borrarReferencias() {
            var finalidad = vis.selectAll(".finalidad").remove();
            var jurisdiccion = vis.selectAll(".jurisdiccion").remove();
        }

        function show_details(data, i, element) {
            d3.select(element).attr("stroke", "black");
            var content = "<span class=\"name\">Finalidad:</span><span class=\"value\"> " + data.finalidad + "</span><br/>";
            content += "<span class=\"name\">Función:</span><span class=\"value\"> " + data.funcion + "</span><br/>";
            content += "<span class=\"name\">Jurisdicción:</span><span class=\"value\"> " + data.jurisdiccion + "</span><br/>";
            content += "<span class=\"name\">Monto:</span><span class=\"value\"> $" + addCommas(montosLiterales(data.monto)) + "</span>";
            tooltip.showTooltip(content, d3.event);
        }

        function hide_details(data, i, element) {
            d3.select(element).attr("stroke", function(d) {
                return d3.rgb(fill_color(d.finalidad)).darker();
            });
            tooltip.hideTooltip();
        }

        var presupuesto = {};
        presupuesto.init = function(_data) {
            custom_chart(_data);
            start();
        };

        return presupuesto;
    })(d3, CustomTooltip);

    custom_bubble_chart.init(data);

    function wrap(text, width) {

        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em"); // ver pos X
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("y", y).attr("x", x).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    var formatNumber = function(n, decimals) {
        var s, remainder, num, negativePrefix, negativeSuffix, prefix, suffix;
        suffix = ""
        negativePrefix = ""
        negativeSuffix = "";

        if (n >= 1000000000) {
            suffix = " mil millones"
            n = n / 1000000000
            decimals = 1
        } else if (n >= 1000000) {
            suffix = " millones"
            n = n / 1000000
            decimals = 1
        } else if (n >= 100000) {
            suffix = ""
            n = n / 100000
            decimals = 1
        }


        prefix = ""
        if (decimals > 0) {
            if (n < 1) {
                prefix = "0"
            };
            s = String(Math.round(n * (Math.pow(10, decimals))));
            if (s < 10) {
                remainder = "0" + s.substr(s.length - (decimals), decimals);
                num = "";
            } else {
                remainder = s.substr(s.length - (decimals), decimals);
                num = s.substr(0, s.length - decimals);
            }
            return negativePrefix + prefix + num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + remainder + suffix + negativeSuffix;
        } else {
            s = String(Math.round(n));
            s = s.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            return negativePrefix + s + suffix + negativeSuffix;
        }
    };

    $(document).ready(function() {

        $('#seleccion a').click(function() {
            var ver_tipo = $(this).attr('id');
            window.location = "#/"+ver_tipo;
            $('#seleccion a').removeClass('disabled');
            $(this).toggleClass('disabled');
            custom_bubble_chart.cambiarVista(ver_tipo);
            return false;
        });

    });


}

