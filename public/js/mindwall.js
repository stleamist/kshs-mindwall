const serverPath = '/messages';

var background = d3.select('.background');

var width = () => background.node().getBoundingClientRect().width,
	height = () => background.node().getBoundingClientRect().height,
	padding = 20;


var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-100))
	.force("collide",  d3.bboxCollide(d => [[0, 0], [d.width()+8, d.height()+8]]).strength(1).iterations(1))
	.on('tick', ticked);

var nodes = simulation.nodes();

setForce(simulation);

// SETUP
const samples = [
	"Hello, world!",
	"Hi",
	"Nice to meet you. And you?"
];

const hangeuls = [
	"Google, headquartered in Mountain View, unveiled the new Android phone at the Consumer Electronic Show.",
	"쒸프트키까 안빠쪄요",
	"아이패드 20에 팝니다 010-6637-8917로 연락주세요",
	"으아아아아아아아아아아",
	"와 신기하다",
	"별로야"
]

d3.range(0).map((d, i) => {
	let data = hangeuls;
	addMessage({ text: data[ i % (data.length) ] });
});

// EVENT LISTENERS
$(document).ready(function() {
	$.get(serverPath, function(messages) {
		messages.forEach(message => {
			nodes.push(message)
			update()
			updateMessage(message)
		});
	});
	$(window).resize(function() {
		setForce(simulation);
		simulation.alpha(1).restart();
	});
});

background.on('mousedown', addPlaceholder);

background.on('mouseup', focusPlaceholder);

// FUNCTIONS
function addPlaceholder() {
	let mouse = d3.mouse(this);
	
	// 기존 플레이스홀더 제거
	let oldPlaceholder = background.select('.bubble-placeholder');
	oldPlaceholder.remove();
	
	// 신규 플레이스홀더 추가
	let placeholder = background.append('div')
		.classed('bubble bubble-placeholder', true)
		.attr('type', 'text')
		.attr('contenteditable', true)
		.style('left', d => `${mouse[0]}px`)
		.style('top', d => `${mouse[1]}px`);
	
	var startTime = null;
	var endTime = null;
	var typingCount = 0;
	
	$(placeholder.node()).keypress(function(e) {
		if( $(this).text().length >= 140 && event.keyCode != 8 ) { 
			event.preventDefault();
		}
		
		typingCount += 1;
		
		if (startTime == null) { // 처음 타이핑
			startTime = new Date().getTime();
		}
		if (e.which != 13) { // 중간 타이핑
			endTime = new Date().getTime();	
		} else { // 마지막 타이핑 (엔터)
			let rawMessage = {
				text: $(this).text(),
				typingCount: typingCount,
				duration: (endTime - startTime)/1000,
				position: [mouse[0], mouse[1]]
				//date: new Date()
			}
			
			placeholder.node().blur(); // 플레이스홀더 포커스 해제
			addMessage(rawMessage); // 메시지 추가
			placeholder.node().remove(); // 플레이스홀더 제거
		}
	});
}
function focusPlaceholder() {
	let placeholder = background.select('.bubble-placeholder');
	placeholder.node().focus();
}


function setForce(simulation) {
	simulation
		.force('x', d3.forceX(width() / 2).strength(50/width()))
		.force('y', d3.forceY(height() / 2).strength(50/height()));
}

function ticked(e) {
	let messages = background.selectAll('.bubble-message');
	
	messages.each(d => {
		d.x = Math.max(padding, Math.min(width() - (d.width() + padding), d.x));
		d.y = Math.max(padding, Math.min(height() - (d.height() + padding), d.y));
	});
	
	messages.style('left', d => `${d.x}px`)
		.style('top', d => `${d.y}px`);
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function addMessage(rawMessage) {
	// 일단 기본 말풍선을 추가한다.
	rawMessage.position = rawMessage.position || [0, 0];
	
	let node = {
		text: rawMessage.text,
		sentiment: rawMessage.sentiment || {score: 0},
		scale: rawMessage.scale || 1,
		x: rawMessage.position[0],
		y: rawMessage.position[1]
	}
	nodes.push(node);
	update();
	
	// 그 후 비동기로 말풍선의 색상과 크기를 얻어낸다.
	$.post(serverPath, rawMessage, function(processedMessage) {
		node.sentiment = processedMessage.sentiment;
		node.scale = processedMessage.scale;
		updateMessage(node);
	});
}

function updateMessage(node) {
	console.log('스코어' + node.sentiment.score)
	let message = d3.select(node.element);
	
	let colorName = '';
	let score = node.sentiment.score;
	let scoreString = Math.abs(score) * 10;
	
	if (score > 0) {
		colorName = 'blue';
	} else if (score == 0) {
		colorName = 'gray';
	} else if (score < 0) {
		colorName = 'red';
	}
	
	message.classed(`bubble-${colorName}`, true);
	message.classed(`bubble-${colorName}-${scoreString}`, true);
	message.style('transform', `scale(${node.scale})`);
}

function update() {
	var messages = background.selectAll('.bubble-message').data(nodes, d => d.text);
	
	messages.enter()
		.append('div')
		.classed('bubble bubble-message', true)
		.each(function(d) {
			d.element = this;
		})
		.text(d => d.text)
		.each(function(d, i) {
			d.width = () => this.getBoundingClientRect().width;
			d.height = () => this.getBoundingClientRect().height;
		})
		.on('mousedown', function() {
			console.log('mousedown')	
		})
		.on('mouseover', function() {
			d3.select(this).raise();
		})
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
		)
		.each(node => {
			updateMessage(node)
		});
		
	
	messages.exit().remove();
	
	simulation.nodes(nodes);
	simulation.alpha(1).restart();
}