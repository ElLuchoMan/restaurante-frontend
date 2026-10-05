module.exports = {
	extends: ['stylelint-config-standard-scss'],
	plugins: ['stylelint-order'],
	rules: {
		'order/properties-order': [
			[
				{ groupName: 'layout', emptyLineBefore: 'always', properties: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index'] },
				{ groupName: 'box-model', properties: ['box-sizing', 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'margin', 'padding'] },
				{ groupName: 'flex-grid', properties: ['flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-direction', 'flex-wrap', 'grid', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'align-items', 'justify-content', 'gap'] },
				{ groupName: 'typography', properties: ['font', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'letter-spacing', 'color'] },
				{ groupName: 'visual', properties: ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'opacity'] },
				{ groupName: 'animation', properties: ['transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'animation'] }
			],
			{ unspecified: 'bottomAlphabetical' }
		],
	},
};
