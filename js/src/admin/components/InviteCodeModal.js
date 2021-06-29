import Alert from 'flarum/common/components/Alert';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class InviteCodeModal extends Modal {
    oninit(vnode) {
        super.oninit(vnode);

        this.emails = [];

        this.doorkey = this.attrs.doorkey;

        this.success = false;
    }

    className() {
        return 'InviteCodeModal Modal--small';
    }

    title() {
        return app.translator.trans('fof-doorman.admin.modal.title');
    }

    oncreate(vnode) {
        super.oncreate(vnode);
        $('#EmailInput')
            .off()
            .on('keydown', (e) => {
                if (e.keyCode === 13 || e.keyCode === 188 || e.keyCode === 32) {
                    e.preventDefault();
                    this.addEmails();
                }
            });
    }

    onremove(vnode) {
        super.onremove(vnode);
        app.alerts.dismiss(this.alert);
    }

    content() {
        return (
            <div className="Modal-body">
                <h3>
                    {app.translator.trans('fof-doorman.admin.modal.group', {
                        group: app.store.getById('groups', this.doorkey.groupId()).nameSingular(),
                    })}
                </h3>
                <div className="helpText">{app.translator.trans('fof-doorman.admin.modal.help')}</div>
                <div className="Form Form--centered">
                    <div className="Form-group">
                        <input
                            type="text"
                            name="text"
                            id="EmailInput"
                            className="FormControl"
                            placeholder={app.translator.trans('fof-doorman.admin.modal.placeholder')}
                            disabled={this.loading}
                        />
                    </div>
                    <div className="Form-group">
                        <ul>
                            {this.emails.map((email, i) => {
                                return (
                                    <li className="emailListItem">
                                        <p>{email}</p>
                                        {Button.component({
                                            className: 'Button',
                                            loading: this.loading,
                                            icon: 'fas fa-times',
                                            onclick: this.removeEmail.bind(this, i),
                                        })}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="Form-group">
                        {Button.component(
                            {
                                className: 'Button Button--primary Button--block',
                                loading: this.loading,
                                onclick: this.send.bind(this),
                                disabled: this.emails.length === 0,
                            },
                            app.translator.trans('fof-doorman.admin.modal.send')
                        )}
                    </div>
                </div>
            </div>
        );
    }

    addEmails() {
        app.alerts.dismiss(this.alert);
        m.redraw();
        this.badEmails = [];

        const value = $('#EmailInput').val();

        value.split(/[ ,]+/).map((email) => {
            if (!this.emails.includes(email)) {
                if (this.emails.length + 1 > this.doorkey.data.attributes.maxUses) {
                    this.alert = app.alerts.show(Alert, { type: 'error' }, app.translator.trans('fof-doorman.admin.modal.max_use_conflict'));
                    m.redraw();
                } else {
                    if (this.validateEmail(email)) {
                        this.emails.push(email);
                        $('#EmailInput').val('');
                        m.redraw();
                    } else {
                        this.badEmails.push(email);
                        this.alert = app.alerts.show(
                            Alert,
                            { type: 'error' },
                            app.translator.trans('fof-doorman.admin.modal.invalid_emails', { emails: this.badEmails.join(', ') })
                        );
                        m.redraw();
                    }
                }
            }
        });
    }

    validateEmail(email) {
        const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    removeEmail(i) {
        this.emails.splice(i, 1);
    }

    send(e) {
        e.preventDefault();

        app.alerts.dismiss(this.alert);

        this.loading = true;

        app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/fof/doorkeys/invites',
            body: {
                emails: this.emails,
                doorkeyId: this.doorkey.data.id,
            },
        }).then(() => {
            app.modal.close();
            this.alert = app.alerts.show(Alert, { type: 'success' }, app.translator.trans('fof-doorman.admin.modal.success'));
        });
    }
}
