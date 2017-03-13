import moment from 'moment';
moment.locale('he');

import Pagination from 'rc-pagination/lib/locale/en_US';
import DatePicker from 'antd/lib/date-picker/locale/en_US';
import TimePicker from 'antd/lib/time-picker/locale/en_US';
import Calendar from 'antd/lib/calendar/locale/en_US';

export default {
	locale: 'he',
	Pagination,
	DatePicker,
	TimePicker,
	Calendar,
	Table: {
		filterTitle: 'סינון',
		filterConfirm: 'אישור',
		filterReset: 'איפוס',
		emptyText: 'לא קיים מידע',
	},
	Modal: {
		okText: 'אישור',
		cancelText: 'ביטול',
		justOkText: 'אישור',
	},
	Popconfirm: {
		okText: 'אישור',
		cancelText: 'ביטוך',
	},
	Transfer: {
		notFoundContent: 'מידע לא נמצא',
		searchPlaceholder: 'חיפוש',
		itemUnit: 'פריט',
		itemsUnit: 'פריטים',
	},
	Select: {
		notFoundContent: 'מידע לא נמצא',
	}
};