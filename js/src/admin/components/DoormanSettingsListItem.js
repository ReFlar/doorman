import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Badge from 'flarum/common/components/Badge';
import Select from 'flarum/common/components/Select';
import Switch from 'flarum/common/components/Switch';
import InviteCodeModal from './InviteCodeModal';
import withAttr from 'flarum/common/utils/withAttr';

export default class DoormanSettingsListItem extends Component {
    oninit(vnode) {
        super.oninit(vnode);

        this.doorkey = this.attrs.doorkey;
        this.doorkeys = this.attrs.doorkeys;
    }

    view() {
        var maxUses = this.doorkey.maxUses();
        var totalUses = this.doorkey.uses();
        var remaining = maxUses - totalUses;

        return (
            <div className="DoormanSettingsListItem">
                <div className="DoormanSettingsListItem-inputs">
                    <input
                        className="FormControl Doorkey-key"
                        type="text"
                        disabled
                        value={this.doorkey.key()}
                        placeholder={app.translator.trans('fof-doorman.admin.page.doorkey.key')}
                        onchange={withAttr('value', this.updateKey.bind(this, this.doorkey))}
                    />
                    {Select.component({
                        options: this.getGroupsForInput(),
                        className: 'Doorkey-select',
                        onchange: this.updateGroupId.bind(this, this.doorkey),
                        value: this.doorkey.groupId() || 3,
                    })}
                    <input
                        className="FormControl Doorkey-maxUses"
                        value={maxUses || '0'}
                        type="number"
                        placeholder={app.translator.trans('fof-doorman.admin.page.doorkey.max_uses')}
                        onchange={withAttr('value', this.updateMaxUses.bind(this, this.doorkey))}
                    />
                    {Switch.component({
                        state: this.doorkey.activates() || false,
                        onchange: this.updateActivates.bind(this, this.doorkey),
                        className: 'Doorkey-switch',
                    })}
                </div>

                {Button.component({
                    type: 'button',
                    className: 'Button Button--warning Doorkey-button',
                    icon: 'fa fa-envelope',
                    onclick: this.showModal.bind(this),
                })}

                {Button.component({
                    type: 'button',
                    className: 'Button Button--warning Doorkey-button',
                    icon: 'fa fa-times',
                    onclick: this.deleteDoorkey.bind(this, this.doorkey),
                })}

                {maxUses > 0 && maxUses === totalUses ? (
                    Badge.component({
                        className: 'Doorkey-badge',
                        icon: 'fas fa-user-slash',
                        label: app.translator.trans('fof-doorman.admin.page.doorkey.warning'),
                    })
                ) : (
                    <div>
                        <h3 className="Doorkey-left">
                            {remaining < 0
                                ? app.translator.trans('fof-doorman.admin.page.doorkey.total_uses', { totalUses })
                                : app.translator.trans('fof-doorman.admin.page.doorkey.left_uses', { remaining })}
                        </h3>
                    </div>
                )}
            </div>
        );
    }

    showModal() {
        app.modal.show(InviteCodeModal, { doorkey: this.doorkey });
    }

    getGroupsForInput() {
        let options = [];

        app.store.all('groups').map((group) => {
            if (group.nameSingular() === 'Guest') {
                return;
            }
            options[group.id()] = group.nameSingular();
        });

        return options;
    }

    updateKey(doorkey, key) {
        doorkey.save({ key });
    }

    updateGroupId(doorkey, groupId) {
        doorkey.save({ groupId });
    }

    updateMaxUses(doorkey, maxUses) {
        doorkey.save({ maxUses });
    }

    updateActivates(doorkey, activates) {
        doorkey.save({ activates });
    }

    deleteDoorkey(doorkeyToDelete) {
        doorkeyToDelete.delete();
        this.doorkeys.some((doorkey, i) => {
            if (doorkey.data.id === doorkeyToDelete.data.id) {
                this.doorkeys.splice(i, 1);
                return true;
            }
        });
    }
}
