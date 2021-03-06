let ghost;
let subTarget;

function mouseMoveInit(target) {
	ghost = target.cloneNode(true);
	ghost.classList.add('ghost');
	subTarget = target.cloneNode(true);
	subTarget.classList.add('afterimage', 'subTarget');
	document.body.appendChild(ghost);

	ghost.style.display = 'none';
}

function setGhostToMouseCursor(event, target) {
	ghost.style.position = 'absolute';
	ghost.style.display = 'list-item';
	ghost.style.zIndex = 1000;
	ghost.style.width = window.getComputedStyle(target).width;
	ghost.style.zIndex = window.getComputedStyle(target).height;

	moveAt(ghost, event.pageX, event.pageY);
}

function isCurrentCard(belowCard) {
	return belowCard?.classList.contains('afterimage');
}

function isCurrentPosition() {
	return (
		subTarget.previousElementSibling?.classList.contains('afterimage') ||
		subTarget.nextElementSibling?.classList.contains('afterimage')
	);
}

export function moveAt(target, pageX, pageY) {
	target.style.left = pageX - target.offsetWidth / 2 + 'px';
	target.style.top = pageY - target.offsetHeight / 2 + 'px';
}

export function onMouseMove(target) {
	mouseMoveInit(target);

	return (event) => {
		target.classList.add('afterimage');
		setGhostToMouseCursor(event, target);

		let [belowCard, todoList] = getPosition(event);

		if (!todoList) {
			// 잘못된 위치에 드랍됐을 때
			subTarget.parentNode?.removeChild(subTarget);

			return;
		}

		if (isCurrentCard(belowCard)) {
			return;
		}

		if (!belowCard) {
			// 잘못된 list가 비었을 때
			todoList.appendChild(subTarget);

			return;
		}

		if (dropPointIsUpper(belowCard, event.clientY)) {
			todoList.insertBefore(subTarget, belowCard);
		} else {
			todoList.insertBefore(subTarget, belowCard.nextElementSibling);
		}

		if (isCurrentPosition()) {
			subTarget.parentNode.removeChild(subTarget);

			return;
		}
	};
}

function getPosition(e) {
	let belowCard;

	ghost.style.display = 'none';
	let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
	ghost.style.display = 'list-item';

	let todoList = getTodoList(elemBelow);

	if (!todoList) {
		return [belowCard, todoList];
	}

	if (elemBelow.closest('.todo-card')) {
		belowCard = elemBelow.closest('.todo-card');
	} else {
		belowCard = getClosestCardElement(todoList.childNodes, e.clientY);
	}

	return [belowCard, todoList];
}

export function mouseUp(e, prevColumnId = -1) {
	let [_, todoList] = getPosition(e);

	if (!todoList) {
		document.body.removeChild(ghost);

		return false;
	}

	ghost.removeAttribute('style');
	ghost.parentNode.removeChild(ghost);
	ghost = null;

	if (!subTarget.parentNode) {
		return false;
	}

	const index = getIndex(subTarget, prevColumnId);
	const nextTodoList = subTarget.closest('.todo-list');
	subTarget.dataset.index = index;

	subTarget.classList.remove('afterimage');
	subTarget.classList.remove('subTarget');
	subTarget = null;

	return [String(index), nextTodoList];
}

function getIndex(subTarget, prevColumnId) {
	const currentColumnId = subTarget.closest('.column').dataset.columnId;

	let result = subTarget.nextElementSibling?.dataset.index;

	if (!result) {
		result =
			currentColumnId === prevColumnId
				? subTarget.parentNode.childNodes.length - 2
				: subTarget.parentNode.childNodes.length - 1;
	}

	return result;
}

function getTodoList(elemBelow) {
	if (!elemBelow) {
		return null;
	}
	if (elemBelow.closest('.column ul')) {
		return elemBelow.closest('.column ul');
	}

	if (elemBelow.classList.contains('column')) {
		return elemBelow.querySelector('ul');
	}

	return null;
}

function getClosestCardElement(todoList, dropYPoint) {
	const closestCard = { offset: Number.POSITIVE_INFINITY, element: null };

	todoList.forEach((card) => {
		const box = card.getBoundingClientRect();
		const boxMidYPoint = box.top + box.height / 2;
		const offset = Math.abs(dropYPoint - boxMidYPoint);

		if (offset < closestCard.offset) {
			closestCard.offset = offset;
			closestCard.element = card;
		}
	});

	return closestCard.element;
}

function dropPointIsUpper(belowCard, currentY) {
	const box = belowCard.getBoundingClientRect();
	const boxMidPoint = box.top + box.height / 2;

	const offset = currentY - boxMidPoint;

	return offset < 0;
}
