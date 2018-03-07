import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IonicPage, NavParams, ViewController, ToastController } from "ionic-angular";

import { SettingsService } from "../../../services/settings";
import { TranslateService } from '@ngx-translate/core';

import { DeviceListService } from "../../../services/devices-list";
import { Device } from "../../../models/device";
import { DeviceCategory } from "../../../models/device-category";
import { Category } from "../../../models/category";

//import {parse, getMinutes, getHours, getDate } from 'date-fns';

@IonicPage()
@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage implements OnInit {
  mode = 'New';
  deviceForm: FormGroup;
  device: Device;
  listDevices: Device[];
  listCategory: Category[];
  category: Category;
  categoryDevice: DeviceCategory;
  listCategoryDevices: DeviceCategory[];
  index: number;

  language: string;
  rtl: string;
  arabic = false;

  days = [];
  check = false;
  annualCheck = false;

  terms = null;

  constructor (
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private dlService: DeviceListService,
    public toastCtrl: ToastController,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.settingsService.getLanguage();
    this.dlService.fetchDevicesCategory()
      .then(
        (devices: DeviceCategory[]) => this.listCategoryDevices = devices
      );
    this.dlService.fetchCategories()
    .then(
      (category: Category[]) => this.listCategory = category
    );
    this.mode = this.navParams.get('mode');
    this.category = this.navParams.get('category');
     if (this.mode == 'Edit') {
      this.device = this.navParams.get('device');
      this.index = this.navParams.get('index');
    } else if (this.mode == 'Category Edit') {
      this.categoryDevice = this.navParams.get('device');
      this.index = this.navParams.get('index');
    }
    // else if (this.mode == 'Add') {
    //   this.categoryDevice = this.navParams.get('deviceCategory');
    //   this.index = this.navParams.get('index');
    // }
    this.initializeForm();
  }

  ionViewWillEnter() {
    this.listDevices = this.dlService.getDevices();
    this.setLanguage();
    //this.countHours();
    //this.countMinutes();
    this.countDays();
  }

  onAutoFill(deviceCategory: DeviceCategory, index: number) {
    const value = this.deviceForm.value;
    this.terms = null;

    let name = deviceCategory.name;
    let quantity = deviceCategory.quantity;
    let power = deviceCategory.power;
    let annualPower = false;
    let hours = deviceCategory.hours;
    let daysUsed = deviceCategory.daysUsed;
    let category = deviceCategory.category;
    let compressor = deviceCategory.compressor;

    this.deviceForm = new FormGroup({
      'name': new FormControl(name, Validators.required),
      'quantity': new FormControl(quantity, Validators.required),
      'annualPower': new FormControl(annualPower),
      'power': new FormControl(power, Validators.required),
      'hours': new FormControl(hours, Validators.required),
      'daysUsed': new FormControl(daysUsed),
      'category': new FormControl(category, Validators.required),
      'compressor': new FormControl(compressor)
    });
  }

  countDays() {
    for(let i = 1; i <= 31; i++) {
      this.days.push({days: i});
    }
    console.log(this.days);
  }

  checked () {
    if(this.check == false){
      this.check = true;
    } else {
      this.check = false;
    }
  }

  annual() {
    if(this.annualCheck == false){
      this.annualCheck = true;
    } else {
      this.annualCheck = false;
    }
    console.log(this.annualCheck);
  }

  setLanguage() {
    this.language = this.translateService.currentLang;
    if(this.language == 'ar')
    {
      this.rtl = 'rtl';
      this.arabic = true;
    }
    return this.rtl;
  }

  onSubmit() {
    const value = this.deviceForm.value;
    // let getDays = parse('0000-00-' + value.daysUsed + 'T00:00:00');
    // value.daysUsed = getDate(new Date(getDays));

    if (this.mode == 'Edit') {
      console.log(this.index, value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.listCategoryDevices[this.index].category, value.compressor);
      this.dlService.updateDevice(this.index, value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.listDevices[this.index].category, value.compressor);
      const toast = this.toastCtrl.create({
        message: 'Edit Successful',
        duration: 1000,
        position: 'bottom'
      });
      toast.present();
    } else if (this.mode == 'Category Edit') {
      console.log(this.index, value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.listCategoryDevices[this.index].category, value.compressor);
      // for(let index = 0; index < this.listDevices.length; index++) {
      //   if(this.listDevices[index].name === this.device.name) {
      //     console.log("Device: ", this.listDevices[index].name);
      //     this.dlService.updateDevice(index, value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.listDevices[this.index].category, value.compressor)
      //   }
      // }
      this.dlService.updateDeviceCategory(this.index, value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.listCategoryDevices[this.index].category, value.compressor);
      const toast = this.toastCtrl.create({
        message: 'Edit Successful',
        duration: 1000,
        position: 'bottom'
      });
      toast.present();
    } else if (this.mode == 'New') {
      if(value.annualPower == true) {
        value.power /= 12;
        value.power /= 30.4;
        value.power /= 24;
        value.power = (value.power * 1000).toFixed(2);
        console.log(value.power);

        // value.hours = '23:59';
        //value.daysUsed = 30.41;
      }
      this.dlService.addDevice(value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.category.name.toUpperCase(), value.compressor);
      for(let index = 0; index < this.listCategoryDevices.length; index++) {
        if(value.name.toUpperCase() == this.listCategoryDevices[index].name &&
           value.quantity == this.listCategoryDevices[index].quantity &&
           value.power == this.listCategoryDevices[index].power &&
           value.hours == this.listCategoryDevices[index].hours &&
           value.daysUsed == this.listCategoryDevices[index].daysUsed &&
           this.category.name.toUpperCase() == this.listCategoryDevices[index].category &&
           value.compressor == this.listCategoryDevices[index].compressor) {
             console.log("Item already exists");

           } else if (index == this.listCategoryDevices.length - 1 &&(
                value.name.toUpperCase() != this.listCategoryDevices[index].name ||
                value.quantity != this.listCategoryDevices[index].quantity ||
                value.power != this.listCategoryDevices[index].power ||
                value.hours != this.listCategoryDevices[index].hours ||
                value.daysUsed != this.listCategoryDevices[index].daysUsed ||
                this.category.name.toUpperCase() != this.listCategoryDevices[index].category ||
                value.compressor != this.listCategoryDevices[index].compressor)) {
             this.dlService.addDeviceCategory(value.name.toUpperCase(), value.quantity, value.power, value.hours, value.daysUsed, this.category.name.toUpperCase(), value.compressor);
            console.log("Item added");
            break;
           }
           console.log("length", this.listCategoryDevices.length);
           console.log("Index", index);
      }
      const toast = this.toastCtrl.create({
        message: 'Item Added Successfully',
        duration: 1000,
        position: 'bottom'
      });
      toast.present();
    }

    this.deviceForm.reset();
    this.viewCtrl.dismiss();
  }

  private initializeForm() {
    let name = null;
    let quantity = null;
    let power = null;
    let annualPower = false;
    let hours = null;
    let daysUsed = 31;
    // let category = null;
    let compressor = 1;

    // if(this.mode == 'New') {
    //   category = this.category.name;
    // }

    if(this.mode == 'Edit'){
      name = this.device.name;
      quantity = this.device.quantity;
      power = this.device.power;
      hours = this.device.hours;
      daysUsed = this.device.daysUsed;
      //category = this.device.category;
      compressor = this.device.compressor;
    }

    if(this.mode == 'Category Edit'){
      name = this.categoryDevice.name;
      quantity = this.categoryDevice.quantity;
      power = this.categoryDevice.power;
      hours = this.categoryDevice.hours;
      daysUsed = this.categoryDevice.daysUsed;
      //category = this.device.category;
      compressor = this.categoryDevice.compressor;
    }

    // if(this.mode == 'Add') {
    //   name = this.categoryDevice.name;
    //   quantity = this.categoryDevice.quantity;
    //   power = this.categoryDevice.power;
    //   hours = this.categoryDevice.hours;
    //   daysUsed = this.categoryDevice.daysUsed;
    //   category = this.categoryDevice.category;
    //   compressor = this.categoryDevice.compressor;
    // }

    this.deviceForm = new FormGroup({
      'name': new FormControl(name, Validators.required),
      'quantity': new FormControl(quantity, Validators.required),
      'annualPower': new FormControl(annualPower),
      'power': new FormControl(power, Validators.required),
      'hours': new FormControl(hours, Validators.required),
      'daysUsed': new FormControl(daysUsed),
      //'category': new FormControl(category, Validators.required),
      'compressor': new FormControl(compressor)
    });
  }
}
