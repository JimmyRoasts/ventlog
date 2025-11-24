export const formatNumber = (
	value: number | null | undefined,
	digits = 0,
	options: Intl.NumberFormatOptions = {}
) =>
	value == null
		? '—'
		: Number(value).toLocaleString('en-US', {
				maximumFractionDigits: digits,
				...options
			});

export const optionLabel = (
	value: string | null | undefined,
	options: { value: string; label: string }[],
	fallback = '—'
) => {
	if (!value) return fallback;
	return options.find((option) => option.value === value)?.label ?? value;
};
