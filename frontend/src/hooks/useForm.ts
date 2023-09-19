import React, {useState} from 'react';

export function useForm<T>(initialValues: T) {
	const [formData, setFormData] = useState<T>(initialValues);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {name, value} = e.target;

		if (name == null || name?.length === 0) {
			return console.error('Input field name must not be null');
		}

		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const resetForm = () => {
		setFormData(initialValues);
	};

	const setNewFormValues = (newValues: T) => {
		setFormData(newValues);
	};

	return {
		formData,
		setNewFormValues,
		handleInputChange,
		resetForm,
	};
}
