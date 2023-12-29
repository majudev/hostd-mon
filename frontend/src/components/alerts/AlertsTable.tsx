import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {v4 as uuidv4} from 'uuid';
import formatDate from '@/utils/formatDate.ts';
import Alert from '@/types/Alert.ts';
import {useNavigate} from 'react-router-dom';

type AlertsTableProps = {
	alerts: Array<Alert>
	doNotShowHostLink?: boolean
};

const AlertsTable: React.FC<AlertsTableProps> = ({alerts, doNotShowHostLink}) => {
	const navigate = useNavigate();

	if (alerts.length === 0) {
		return  <Typography mx={1} variant="caption">No alerts yet</Typography>;
	}

	return <TableContainer>
		<Table stickyHeader>
			<TableHead>
				<TableRow>
					<TableCell>Alert ID</TableCell>
					<TableCell>Host</TableCell>
					<TableCell>Message</TableCell>
					<TableCell>Sent to</TableCell>
					<TableCell>Timestamp</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{alerts.map(alert => (
					<TableRow
						key={uuidv4()}
					>
						<TableCell>{alert.id ?? '-'}</TableCell>
						<TableCell
							onClick={
								doNotShowHostLink ?
									undefined :
									() => navigate(`/host/${alert.Host.id}`)
							}
							title={doNotShowHostLink ? undefined : `Click to view ${alert.Host.name} host`}
							sx={doNotShowHostLink ? {} : {cursor: 'pointer'}}
						>
							{alert.Host.name ?? '-'}
						</TableCell>
						<TableCell>{alert.message ?? '-'}</TableCell>
						<TableCell>{alert.sentTo.join('\n')}</TableCell>
						<TableCell>{formatDate(new Date(alert.timestamp))}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	</TableContainer>
};

export default AlertsTable;
