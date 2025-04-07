// Inicialización de variables  
let states = []; // Lista de estados  
let alphabet = []; // Alfabeto del autómata  
let transitions = []; // Transiciones entre estados  
let currentState = null; // Estado actual seleccionado  
let canvas = document.getElementById('graphCanvas');
let ctx = canvas.getContext('2d');

// Variables para el arrastre
let isDragging = false;
let dragNode = null;
let offsetX, offsetY; // Desplazamiento para arrastrar

// Definimos un grafo para representar los estados y transiciones           
let graph = {
    nodes: [],
    edges: [],
};

// Función para dibujar el grafo en el canvas 
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
        const offset = 10 * index;  // Desplazamiento en el eje X o Y

        // Calcular el ángulo entre los dos nodos para colocar las flechas correctamente
        let angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);

        // Calcular las coordenadas del borde del círculo en el que la flecha debe comenzar
        let startX = edge.from.x + Math.cos(angle) * 30; // Desplazar 30px hacia el borde
        let startY = edge.from.y + Math.sin(angle) * 30;

        // Calcular las coordenadas del borde del círculo de destino para las flechas
        let endX = edge.to.x - Math.cos(angle) * 30; // Desplazar 30px hacia el borde
        let endY = edge.to.y - Math.sin(angle) * 30;

        // Dibujar la transición (flecha) desde el borde del nodo de inicio al borde del nodo de destino
        ctx.beginPath();
        ctx.moveTo(startX + offset, startY + offset);
        ctx.lineTo(endX + offset, endY + offset);
        ctx.stroke();

        // Dibujar la flecha en el extremo de la transición
        let arrowSize = 10;
        ctx.save();
        ctx.translate(endX + offset, endY + offset);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-arrowSize / 2, -arrowSize / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowSize / 2, arrowSize / 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.restore();

        // Dibujar la etiqueta de la transición    
        ctx.fillText(edge.label, (startX + offset + endX + offset) / 2, (startY + offset + endY + offset) / 2);
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

// Detectar el clic sobre un nodo (estado) para iniciar el arrastre
canvas.addEventListener('mousedown', function(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    graph.nodes.forEach(node => {
        const distance = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
        if (distance < 30) { // Si el clic es dentro del nodo (radio de 30px)
            isDragging = true;
            dragNode = node;
            offsetX = mouseX - node.x;
            offsetY = mouseY - node.y;
        }
    });
});

// Mover el nodo (estado) mientras se arrastra el ratón               
canvas.addEventListener('mousemove', function(event) {
    if (isDragging && dragNode) {
        dragNode.x = event.offsetX - offsetX;
        dragNode.y = event.offsetY - offsetY;
        drawGraph();
    }
});

// Soltar el nodo (estado) cuando se suelta el ratón       
canvas.addEventListener('mouseup', function() {
    isDragging = false;
    dragNode = null;
});