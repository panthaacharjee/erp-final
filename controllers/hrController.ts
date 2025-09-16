import { Request, Response, NextFunction } from "express";

const catchAsyncError = require("../middleware/catchAsyncError");
import User from "../models/Employee/UserModel";
import Salary from "../models/Salary/SalaryModel";

import ErrorHandler from "../utils/errorhandler";
import generatePDFFromUrl from "../utils/generatePdf";
import path from "path";
const fs = require("fs");
const handlebars = require("handlebars");
import mergePdfs from "../utils/MergePdf";

/* =====================================================================================================*/
/* ============================= Employee Details (get) (/employee/details) ================================= */
/* ===================================================================================================== */

exports.employeeDetails = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(ErrorHandler("USER NOT FOUND", 404, res, next));
    }

    const htmlPath = path.join(__dirname, "../html/hr/userInformation.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const template = handlebars.compile(htmlContent);

    const joinDate = new Date(user?.joinDate ? user?.joinDate : Date.now());
    const monthArray = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const data = {
      title: `${user?.employeeId}`,
      name: user?.name,
      designation: user?.designation,
      work: user?.category ? user?.category : null,
      section: user?.section ? user?.section : user?.department,
      join: `${joinDate.getDate()}, ${
        monthArray[joinDate.getMonth()]
      } ${joinDate.getFullYear()}`,
      phone:
        user?.personalInformation?.phone &&
        user?.personalInformation.phone.length <= 10
          ? `+880${user?.personalInformation.phone}`
          : user?.personalInformation.phone,
      blood: user?.personalInformation.blood,
      address: `${user?.address?.vill}, ${user?.address?.thana}, ${user?.address?.post}, ${user?.address?.district}, Bangladesh`,
      nid: user?.personalInformation?.nid,
    };
    const html = template(data);

    const pdfBuffer = await generatePDFFromUrl({
      html: html,
      outputPath: "report.pdf",
    }).catch(console.error);

    // Send the PDF directly as a binary response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=employee-details.pdf",
    });
    res.send(pdfBuffer);
    // console.log(pdfBuffer)
  }
);

/* =====================================================================================================*/
/* ============================= ALL EMPLOYEE (get) (/all/user) ================================= */
/* ===================================================================================================== */
exports.allEmployee = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { nameFilter, idFilter, categoryFilter } = req.query;

    const namesArray =
      typeof nameFilter === "string"
        ? nameFilter.split(",")
        : Array.isArray(nameFilter)
        ? nameFilter
        : [];

    const idsArray =
      typeof idFilter === "string"
        ? idFilter.split(",")
        : Array.isArray(idFilter)
        ? idFilter
        : [];

    const categoriesArray =
      typeof categoryFilter === "string"
        ? categoryFilter.split(",")
        : Array.isArray(categoryFilter)
        ? categoryFilter
        : [];

    if (
      namesArray.length > 0 &&
      idsArray.length > 0 &&
      categoriesArray.length > 0
    ) {
      const users = await User.find({ account: "Regular" });
      const filterUsers = await User.find({
        name: { $in: namesArray },
        employeeId: { $in: idsArray },
        category: { $in: categoriesArray },
        account: "Regular",
      });
      res.status(200).json({
        success: true,
        users,
        filterUsers,
      });
    }
    const users = await User.find({ account: "Regular" });

    res.status(200).json({
      success: true,
      users,
      filterUsers: users,
    });
  }
);

/* ===================================================================================================== */
/* =================== EMPLOYEE SALARY CREATE (post) (/employee/salary/create) ========================= */
/* ===================================================================================================== */

exports.salaryCreate = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { data, date }: { data: any[]; date: Date } = req.body;

    // Validate input data
    if (!data || data.length < 1) {
      return next(ErrorHandler("DATA IS REQUIRED", 400, res, next));
    }

    // Check For Missing Parameter
    const missingPresent = data.some((item) => item.Present === undefined);
    const missingWeekend = data.some((item) => item.Weekend === undefined);
    const missingHolidays = data.some((item) => item.Holidays === undefined);
    const missingAbsent = data.some((item) => item.Absent === undefined);
    const missingCL = data.some((item) => item.CL === undefined);
    const missingSick = data.some((item) => item.Sick === undefined);
    const missingEarn = data.some((item) => item.Earn === undefined);
    const missingMaternity = data.some((item) => item.Maternity === undefined);
    const missingOTHours = data.some((item) => item.OTHours === undefined);
    const missingOTRate = data.some((item) => item.OTRate === undefined);
    const missingOTAmount = data.some((item) => item.OTRate === undefined);
    const missingAdvanced = data.some((item) => item.Advanced === undefined);
    const missingAbsenteeism = data.some(
      (item) => item.Absenteeism === undefined
    );
    const missingLoan = data.some((item) => item.Loan === undefined);
    const missingPF = data.some((item) => item.PF === undefined);
    const missingOthers = data.some((item) => item.Others === undefined);
    const missingIncomeTax = data.some((item) => item.Income === undefined);

    if (missingPresent) {
      return next(
        ErrorHandler(
          "PRESENT FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingWeekend) {
      return next(
        ErrorHandler(
          "WEEKEND FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingHolidays) {
      return next(
        ErrorHandler(
          "HOLIDAYS FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingAbsent) {
      return next(
        ErrorHandler(
          "ABSENT FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingCL) {
      return next(
        ErrorHandler("CL FIELD IS MISSING IN ONE OR MORE ROWS", 400, res, next)
      );
    }
    if (missingSick) {
      return next(
        ErrorHandler(
          "SICK FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingEarn) {
      return next(
        ErrorHandler(
          "EARN FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingMaternity) {
      return next(
        ErrorHandler(
          "MATERNITY FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingOTHours) {
      return next(
        ErrorHandler(
          "OT HOURS  FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingOTRate) {
      return next(
        ErrorHandler(
          "OT RATE FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingOTAmount) {
      return next(
        ErrorHandler(
          "OT AMOUNT FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingAdvanced) {
      return next(
        ErrorHandler(
          "ADVANCED FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingAbsenteeism) {
      return next(
        ErrorHandler(
          "ABSENTEEISM FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingLoan) {
      return next(
        ErrorHandler(
          "LOAN FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingPF) {
      return next(
        ErrorHandler("PF FIELD IS MISSING IN ONE OR MORE ROWS", 400, res, next)
      );
    }
    if (missingOthers) {
      return next(
        ErrorHandler(
          "OTHERS FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }
    if (missingIncomeTax) {
      return next(
        ErrorHandler(
          "INCOME TAX FIELD IS MISSING IN ONE OR MORE ROWS",
          400,
          res,
          next
        )
      );
    }

    // Get all employee IDs from the input data
    const employeeIds = data.map((item) => item.ID);

    // Single query to get all regular users
    const regularUsers = await User.find({
      account: "Regular",
      employeeId: { $in: employeeIds },
    });

    // Check counts with single operations
    if (data.length > regularUsers.length) {
      return next(
        ErrorHandler("EXCEL CONTAYS EMPLOYEES NOT IN DATABASE", 404, res, next)
      );
    }

    const totalRegularUsers = await User.countDocuments({ account: "Regular" });
    if (data.length < totalRegularUsers) {
      return next(ErrorHandler("NOT ALL EMPLOYEES INCLUDED", 404, res, next));
    }

    const userMap = new Map(
      regularUsers.map((user) => [user.employeeId, user._id])
    );

    const filterDate = new Date(date);
    const year = filterDate.getFullYear();
    const month = filterDate.getMonth() + 1;

    const existingSalaries = await Salary.find({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    }).select("user date");

    if (existingSalaries.length > 0) {
      const existingUserIds = existingSalaries.map((s) => s.user);
      const existingEmployees = regularUsers
        .filter(
          (user: any) => !existingUserIds.some((id) => id.equals(user._id))
        )
        .map((user) => user.employeeId);

      if (existingEmployees.length > 0) {
        return next(
          ErrorHandler(
            `SALARIES EXIST! BUT NOT EXIST EMPLOYEES: ${existingEmployees.join(
              ", "
            )} ON ${date}`,
            400,
            res,
            next
          )
        );
      } else {
        return next(ErrorHandler(`SALARIES EXIST ON ${date}`, 400, res, next));
      }
    }

    const bulkOps = data.map((item) => ({
      insertOne: {
        document: {
          user: userMap.get(item.ID),
          date: date,
          salary: {
            main: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.mainSalary,
            basic: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.basic,
            home: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.home,
            food: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.food,
            medical: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.medical,
            conveyance: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.conveyance,
            special: regularUsers.filter((i) => i.employeeId === item.ID)[0]
              ?.salary?.special,
          },
          attendence: {
            present: item.Present,
            weekend: item.Weekend,
            holidays: item.Holidays,
            absent: item.Absent,
          },
          leave: {
            cl: item.CL,
            sick: item.Sick,
            earn: item.Earn,
            meternity: item.Maternity,
          },
          ot: {
            hours: item.OTHours,
            rate: item.OTRate,
            amount: item.OTAmount,
          },
          deduction: {
            advanced: item.Advanced,
            absenteeism: item.Absenteeism,
            loan: item.Loan,
            pf: item.PF,
            others: item.Others,
            tax: item.Income,
          },
        },
      },
    }));
    await Salary.bulkWrite(bulkOps, { ordered: false });

    res.status(200).json({
      success: true,
      message: "SALARIES UPDATED SUCCESSFULLY",
    });
  }
);

/* ===================================================================================================== */
/* ============== EMPLOYEE SINGLE SALARY CREATE (post) (/employee/single/salary/create) ================= */
/* ===================================================================================================== */
exports.singleSalary = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      date,
      id,
      present,
      weekend,
      holidays,
      absent,
      casual,
      sick,
      earn,
      maternity,
      ot_hours,
      ot_rate,
      ot_amount,
      advanced,
      abseentism,
      loan,
      pf,
      others,
      tax,
    }: {
      date: Date;
      id: string;
      present: number;
      weekend: number;
      holidays: number;
      absent: number;
      casual: number;
      sick: number;
      earn: number;
      maternity: number;
      ot_rate: number;
      ot_hours: number;
      ot_amount: number;
      advanced: number;
      abseentism: number;
      loan: number;
      pf: number;
      others: number;
      tax: number;
    } = req.body;

    const user = await User.findOne({ employeeId: id });
    const filterDate = new Date(date);
    const year = filterDate.getFullYear();
    const month = filterDate.getMonth() + 1;

    const existingSalaries = await Salary.findOne({
      user: user?._id,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    }).select("user date");

    if (existingSalaries !== null) {
      await Salary.findByIdAndUpdate(existingSalaries._id, {
        user: user?._id,
        date: date,
        salary: {
          main: user?.mainSalary,
          basic: user?.salary?.basic,
          home: user?.salary?.home,
          food: user?.salary?.food,
          conveyance: user?.salary?.conveyance,
          medical: user?.salary?.medical,
          special: user?.salary?.special,
        },
        attendence: {
          present,
          weekend,
          absent,
          holidays,
        },
        leave: {
          cl: casual,
          sick,
          earn,
          meternity: maternity,
        },
        ot: {
          hours: ot_hours,
          rate: ot_rate,
          amount: ot_amount,
        },
        deduction: {
          advanced,
          abseentism,
          loan,
          pf,
          others,
          tax,
        },
      });
      res.status(200).json({
        success: true,
        message: "SUCCESSFULLY SALARY UPDATED",
      });
    } else {
      await Salary.create({
        user: user?._id,
        date: date,
        attendence: {
          present,
          weekend,
          absent,
          holidays,
        },
        leave: {
          casual,
          sick,
          earn,
          maternity,
        },
        ot: {
          hours: ot_hours,
          rate: ot_rate,
          amount: ot_amount,
        },
        deduction: {
          advanced,
          abseentism,
          loan,
          pf,
          others,
          tax,
        },
      });
      res.status(200).json({
        success: true,
        message: "SUCCESSFULLY SALARY CREATED",
      });
    }
  }
);

/* ===================================================================================================== */
/* ============== EMPLOYEE SALARY PDF GENARATE (post) (/employee/salary/pdf) ================= */
/* ===================================================================================================== */
exports.pdfSalary = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, users }: { date: Date; users: any } = req.body;

    const filterDate = new Date(date);
    const year = filterDate.getFullYear();
    const month = filterDate.getMonth() + 1;

    const employeesSalaryList = await Salary.find({
      user: { $in: users },
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    })
      .populate("user")
      .lean();

    if (employeesSalaryList.length <= 0) {
      return next(ErrorHandler(`NO SALARY FOUND IN ${date}`, 404, res, next));
    }

    const htmlPath = path.join(__dirname, "../html/hr/salaryInformation.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const template = handlebars.compile(htmlContent);

    const pdfBuffers = await Promise.all(
      employeesSalaryList.map(async (employee) => {
        if (
          typeof employee.user === "object" &&
          "employeeId" in employee.user
        ) {
          const monthHalf = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthFull = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "Augest",
            "September",
            "October",
            "November",
            "December",
          ];

          const joinDate = new Date(employee.user.joinDate);
          const dateJoin = `${joinDate.getDate()}-${
            monthHalf[joinDate.getMonth()]
          }-${joinDate.getFullYear()}`;

          const salaryDate = `${
            monthFull[new Date(date).getMonth()]
          }-${new Date(date).getFullYear()}`;

          const totalSalary =
            employee.salary.main +
            employee.salary.special +
            employee.ot.amount -
            employee.deduction.advanced -
            employee.deduction.absenteeism -
            employee.deduction.loan -
            employee.deduction.pf -
            employee.deduction.tax -
            employee.deduction.tax;

          const html = template({
            salaryDate: salaryDate,
            name: employee.user.name,
            id: employee.user.employeeId,
            designation: employee.user.designation,
            department: employee.user.department,
            category: employee.user.category,
            joinDate: dateJoin,
            grade: employee.user.grade,
            basic: employee.salary.basic,
            home: employee.salary.home,
            medical: employee.salary.medical,
            conveyance: employee.salary.conveyance,
            food: employee.salary.food,
            gross: employee.salary.main,
            special: employee.salary.special,
            present: employee.attendence.present,
            absent: employee.attendence.absent,
            holidays: employee.attendence.holidays,
            weekend: employee.attendence.weekend,
            cl: employee.leave.cl,
            sick: employee.leave.sick,
            earn: employee.leave.earn,
            maternity: employee.leave.meternity,
            ot_hours: employee.ot.hours,
            ot_rate: employee.ot.rate,
            ot_amount: employee.ot.amount,
            advanced: employee.deduction.advanced,
            absenteeism: employee.deduction.absenteeism,
            loan: employee.deduction.loan,
            pf: employee.deduction.pf,
            others: employee.deduction.others,
            tax: employee.deduction.tax,
            account: employee.user.bank.account,
            payable: totalSalary,
          });
          return generatePDFFromUrl({
            html: html,
          });
        }
      })
    );

    const combinedPdf = await mergePdfs(pdfBuffers); // You'll need a PDF merging library

    // Send response once
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=employee-salaries.pdf",
    });
    res.send(combinedPdf);
  }
);
