import {HostConfigFormFields} from '@/components/host/HostConfigForm.tsx';

export const getErrorMessageIfHostParamsNotValid = ({
	                                                    name,
	                                                    rhp,
	                                                    rhpAddress,
	                                                    rhpPubkey,
	                                                    rhpDeadtime,
	                                                    extramon,
	                                                    extramonPubkey,
	                                                    extramonDeadtime
                                                    }: HostConfigFormFields
): string | null => {
	if (name == null || name.length === 0) {
		return 'Name is required';
	}

	if (rhp && (rhpAddress == null || rhpAddress.length === 0 || rhpPubkey == null || rhpPubkey.length === 0 || rhpDeadtime == null)) {
		return 'rhpAddress, rhpPubkey and rhp dead time are required';
	}

	if (extramon && (extramonPubkey == null || extramonPubkey.length === 0 || extramonDeadtime == null)) {
		return 'extramonPubkey and extramon dead time are required';
	}

	return null;
}
