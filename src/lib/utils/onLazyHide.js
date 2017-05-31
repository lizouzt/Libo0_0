const ACTIVE = 'lh_active';
const onLazyHide = function (opts) {
	const RETAIN_TOP = opts.top;
	const el_wrapper = opts.el;

	let _isHide = false;

	const negative = () => {
		_isHide = true;
		el_wrapper.classList.remove(ACTIVE);
	}

	const active = () => {
		_isHide = false;
		el_wrapper.classList.add(ACTIVE);
	}

	let timer = false, topArr = [];
	const direction = (top) => {
		if (Math.abs(topArr[0] - topArr[2]) < 100) {
			return;
		}

		let ret = 0;
		if (topArr[0] < topArr[1] && topArr[1] < topArr[2]) {
			ret = 1;
		} else if (topArr[0] > topArr[1] && topArr[1] > topArr[2]) {
			ret = -1;
		}

		if (ret == 1) {
			negative();
		} else if (ret == -1) {
			active();
		}
	}

	const scrollJudge = (top) => {
		if (!timer) {
			timer = true;

			if (topArr.length < 3) {
				topArr.push(top);
			} else {
				direction();
				topArr = [];
			}

			setTimeout( function () {
				timer = false;
			}, 50);
		}
	}

	window.addEventListener('scroll', (e) => {
		const top = document.body.scrollTop;

		if (top > RETAIN_TOP) {
			scrollJudge(top);
		} else {
			if (_isHide) {
				active();
			}
		}
	});

	el_wrapper.classList.add(ACTIVE);
}

module.exports = onLazyHide;
