// Inicialización de variables  
let states = []; // Lista de estados  
let alphabet = []; // Alfabeto del autómata  
let transitions = []; // Transiciones entre estados  
let currentState = null; // Estado actual seleccionado  
let canvas = document.getElementById('graphCanvas');
let ctx = canvas.getContext('2d');

// Variables para el arrastre
let isDraggingNode = false;
let isDraggingEdge = false;
let dragNode = null;
let dragEdge = null;
let dragOffsetX = 0, dragOffsetY = 0; // Desplazamiento para arrastrar

// Definimos un grafo para representar los estados y transiciones           
let graph = {
    nodes: [],
    edges: [],
};

// Función para dibujar el grafo en el canvas 
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los nodos
    graph.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI); // Nodo con radio de 30px   
        ctx.fillStyle = 'lightblue';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText(node.id, node.x - 10, node.y + 5);
    });

    // Dibujar las transiciones como flechas
    graph.edges.forEach((edge, index) => {
        // Calcular el ángulo entre los dos nodos para colocar las flechas correctamente
        let angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);

        // Desplazamiento único para cada transición
        const separation = 15; // Desplazamiento extra para separar las transiciones
        const offset = separation * Math.sin(index); // Generar desplazamiento en función del índice

        // Calcular las coordenadas del borde del círculo en el que la flecha debe comenzar
        let startX = edge.from.x + Math.cos(angle) * 30; // Desplazar 30px hacia el borde
        let startY = edge.from.y + Math.sin(angle) * 30;

        // Calcular las coordenadas del borde del círculo de destino para las flechas
        let endX = edge.to.x - Math.cos(angle) * 30; // Desplazar 30px hacia el borde
        let endY = edge.to.y - Math.sin(angle) * 30;

        // Ajustar las transiciones para que no se sobrepongan
        startX += offset;
        startY += offset;
        endX += offset;
        endY += offset;

        // Dibujar la transición (flecha) desde el borde del nodo de inicio al borde del nodo de destino
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Dibujar la flecha en el extremo de la transición
        let arrowSize = 10;
        ctx.save();
        ctx.translate(endX, endY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-arrowSize / 2, -arrowSize / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowSize / 2, arrowSize / 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.restore();

        // Dibujar la etiqueta de la transición      
        ctx.fillText(edge.label, (startX + endX) / 2, (startY + endY) / 2);
    });
}

// Función para agregar un estado 
document.getElementById('addState').addEventListener('click', function() {
    let newStateId = prompt("Ingrese un ID para el nuevo estado:");

    // Convertir a minúsculas y validar el formato
    newStateId = newStateId.toLowerCase(); // Convertir todo a minúsculas
    
    // Validar el formato 'q' seguido de un número (ej. q0, q1, q2, ...)
    const regex = /^q\d+$/; // Expresión regular que permite solo 'q' seguido de números
    
    if (newStateId && regex.test(newStateId)) {
        // Verificar si el estado ya existe
        if (!states.includes(newStateId)) {
            // Si no existe, agregamos el estado al grafo
            let newNode = {
                id: newStateId,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            };

            graph.nodes.push(newNode);
            states.push(newStateId); // Agregamos el estado al array 'states'
            drawGraph();
        } else {
            alert("El estado ya existe. Por favor, ingresa un ID único.");
        }
    } else if (!regex.test(newStateId)) {
        alert("El ID del estado debe ser en el formato 'q' seguido de un número, por ejemplo: q0, q1, q2.");
    } else {
        alert("Por favor, ingresa un ID para el estado.");
    }
});

// Función para agregar una transición    
document.getElementById('addTransition').addEventListener('click', function() {
    let fromState = prompt("Ingrese el estado de origen:");
    let toState = prompt("Ingrese el estado de destino:");
    let symbol = prompt("Ingrese el símbolo de la transición:");
    
    let fromNode = graph.nodes.find(node => node.id === fromState);
    let toNode = graph.nodes.find(node => node.id === toState);

    if (fromNode && toNode && symbol) {
        let newEdge = {
            from: fromNode,
            to: toNode,
            label: symbol
        };
        graph.edges.push(newEdge);
        drawGraph();
    }
});

// Detectar el clic sobre un nodo (estado) para arrastrarlo
canvas.addEventListener('mousedown', function(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Verificar si el clic fue sobre un nodo (estado)
    graph.nodes.forEach(node => {
        const distance = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
        if (distance < 30) { // Si el clic es dentro del nodo (radio de 30px)
            isDraggingNode = true;
            dragNode = node;
            dragOffsetX = mouseX - node.x;
            dragOffsetY = mouseY - node.y;
        }
    });

    // Verificar si el clic fue sobre una flecha (transición)
    graph.edges.forEach(edge => {
        const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
        const startX = edge.from.x + Math.cos(angle) * 30;
        const startY = edge.from.y + Math.sin(angle) * 30;
        const endX = edge.to.x - Math.cos(angle) * 30;
        const endY = edge.to.y - Math.sin(angle) * 30;

        // Verificar si el clic está cerca de la flecha  
        const distanceToStart = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
        const distanceToEnd = Math.sqrt(Math.pow(mouseX - endX, 2) + Math.pow(mouseY - endY, 2));
        
        if (distanceToStart < 10 || distanceToEnd < 10) {
            isDraggingEdge = true;
            dragEdge = edge;
            dragOffsetX = mouseX - startX;
            dragOffsetY = mouseY - startY;
        }
    });
});

// Mover el nodo (estado) mientras se arrastra el ratón                           
canvas.addEventListener('mousemove', function(event) {
    if (isDraggingNode && dragNode) {
        dragNode.x = event.offsetX - dragOffsetX;
        dragNode.y = event.offsetY - dragOffsetY;
        drawGraph();
    }

    if (isDraggingEdge && dragEdge) {
        const angle = Math.atan2(dragEdge.to.y - dragEdge.from.y, dragEdge.to.x - dragEdge.from.x);
        const displacementX = event.offsetX - dragOffsetX;
        const displacementY = event.offsetY - dragOffsetY;

        dragEdge.from.x += displacementX;
        dragEdge.from.y += displacementY;
        dragEdge.to.x += displacementX;
        dragEdge.to.y += displacementY;

        dragOffsetX = event.offsetX;
        dragOffsetY = event.offsetY;
        
        drawGraph();
    }
});

// Soltar el nodo o la transición cuando se suelta el ratón     
canvas.addEventListener('mouseup', function() {
    isDraggingNode = false;
    isDraggingEdge = false;
    dragNode = null;
    dragEdge = null;
});